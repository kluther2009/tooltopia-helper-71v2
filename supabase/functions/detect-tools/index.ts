
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function extractJsonFromText(text: string): any {
  try {
    // First try direct JSON parse
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to find JSON array in the text
    const jsonMatch = text.match(/\[\s*{[^]*}\s*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse matched JSON:', e);
      }
    }
    
    // Try to find coordinate system info separately
    const coordSystemMatch = text.match(/{[^}]*"origin"[^}]*}/);
    let coordinateSystem = null;
    if (coordSystemMatch) {
      try {
        coordinateSystem = JSON.parse(coordSystemMatch[0]);
        console.log('Found coordinate system info:', coordinateSystem);
      } catch (e) {
        console.error('Failed to parse coordinate system info:', e);
      }
    }
    
    // If still no valid JSON, try to extract individual tool objects
    const toolsArray = [];
    const toolMatches = text.matchAll(/{[^}]+}/g);
    for (const match of toolMatches) {
      try {
        const tool = JSON.parse(match[0]);
        if (tool.label && Array.isArray(tool.box_2d) && tool.box_2d.length === 4) {
          // Ensure coordinates are normalized to 0-1000 range
          if (tool.box_2d.some(coord => coord > 1000)) {
            tool.box_2d = tool.box_2d.map(coord => Math.min(Math.round(coord), 1000));
          }
          toolsArray.push(tool);
        }
      } catch (e) {
        console.error('Failed to parse individual tool:', e);
      }
    }
    
    if (toolsArray.length > 0) {
      return {
        tools: toolsArray,
        coordinate_system: coordinateSystem
      };
    }
    
    throw new Error('No valid JSON found in response');
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()
    console.log('Processing image URL:', imageUrl)
    
    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    // Initialize Gemini AI
    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY')
    if (!apiKey) {
      throw new Error('GOOGLE_CLOUD_VISION_API_KEY not found')
    }

    console.log('Initializing Gemini...')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

    // Fetch and process image
    console.log('Fetching image...')
    const imgResponse = await fetch(imageUrl)
    if (!imgResponse.ok) {
      throw new Error(`Failed to fetch image: ${imgResponse.status}`)
    }

    const imageBuffer = await imgResponse.arrayBuffer()
    console.log('Image fetched, size:', imageBuffer.byteLength)
    
    if (imageBuffer.byteLength === 0) {
      throw new Error('Image buffer is empty')
    }

    // Convert image to base64 using the helper function
    console.log('Converting image to base64...')
    const base64Image = arrayBufferToBase64(imageBuffer)
    console.log('Image converted to base64')

    // Call Gemini API with a simplified prompt focusing on normalized coordinates
    console.log('Calling Gemini API...')
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: "Identify all tools in this image. For each tool, provide its name as 'label' and its bounding box coordinates as 'box_2d' in the format [y_min, x_min, y_max, x_max] where all values are normalized between 0-1000. Return the result as a JSON array of objects, each with 'label' and 'box_2d' properties. Example: [{\"label\": \"hammer\", \"box_2d\": [100, 200, 300, 400]}, {\"label\": \"screwdriver\", \"box_2d\": [500, 600, 700, 800]}]" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    })

    const response = await result.response
    const text = response.text()
    
    // Log the full Gemini API response
    console.log('Gemini API Response:', JSON.stringify(result, null, 2))
    console.log('Raw response text:', text)

    // Parse response with improved parsing logic
    let toolsData = {
      coordinate_system: {
        origin: "top-left",
        x_axis_direction: "left-to-right",
        y_axis_direction: "top-to-bottom"
      },
      tools: []
    }
    
    try {
      const extractedData = extractJsonFromText(text);
      
      // Handle different formats that might be returned
      if (Array.isArray(extractedData)) {
        // If we got just an array of tools
        toolsData.tools = extractedData.filter(item => {
          return item && 
                 typeof item.label === 'string' && 
                 Array.isArray(item.box_2d) && 
                 item.box_2d.length === 4
        });
        
        // Ensure coordinates are normalized to 0-1000 range
        toolsData.tools.forEach(tool => {
          if (tool.box_2d.some(coord => coord > 1000)) {
            tool.box_2d = tool.box_2d.map(coord => Math.min(Math.round(coord), 1000));
          }
        });
      } else if (extractedData.tools) {
        // If we got the expected format with coordinate system and tools
        toolsData = extractedData;
        toolsData.tools = toolsData.tools.filter(item => {
          return item && 
                 typeof item.label === 'string' && 
                 Array.isArray(item.box_2d) && 
                 item.box_2d.length === 4
        });
        
        // Ensure coordinates are normalized to 0-1000 range
        toolsData.tools.forEach(tool => {
          if (tool.box_2d.some(coord => coord > 1000)) {
            tool.box_2d = tool.box_2d.map(coord => Math.min(Math.round(coord), 1000));
          }
        });
      }

      console.log('Processed tools data:', toolsData)
      
      // Log each tool's bounding box data
      toolsData.tools.forEach(tool => {
        console.log(`Tool "${tool.label}" bounding box:`, {
          format: 'Normalized [y_min, x_min, y_max, x_max]',
          values: tool.box_2d,
          normalizedRange: '0-1000'
        })
      })
    } catch (e) {
      console.error('Error parsing response:', e)
      throw new Error(`Failed to parse tool detection results: ${e.message}`)
    }

    return new Response(
      JSON.stringify(toolsData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
