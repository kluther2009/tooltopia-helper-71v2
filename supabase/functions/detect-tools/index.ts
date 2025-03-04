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

function parseToolsFromText(text: string): any[] {
  // This simple implementation extracts tool names from a list format
  // It looks for patterns like:
  // 1. Tool name
  // - Tool name
  // * Tool name
  // • Tool name
  const tools = [];
  const lines = text.split('\n');
  
  // Regular expression to match list formats
  const listItemRegex = /^(?:\d+[\.\)]|\-|\*|•)\s+(.+)$/;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 0) {
      const match = trimmedLine.match(listItemRegex);
      if (match) {
        const toolName = match[1].trim();
        if (toolName) {
          tools.push({
            label: toolName,
            box_2d: [] // Empty bounding box since we don't have coordinates
          });
        }
      }
    }
  });
  
  return tools;
}

function extractToolData(text: string): { tools: any[], raw_response: string } {
  console.log('Extracting tool data from raw text...');
  
  // Keep the raw response for debugging
  const raw_response = text;
  let tools = [];
  
  // Look for specific patterns in the response
  // Sometimes Gemini returns a list of items with their normalized coordinates
  const lines = text.split('\n');
  const toolPattern = /([^:]+):\s*\[(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\]/;
  
  lines.forEach(line => {
    const match = line.trim().match(toolPattern);
    if (match) {
      // Extract name and coordinates
      const [_, name, yMin, xMin, yMax, xMax] = match;
      
      // Convert coordinates to numbers and normalize them (they might be already normalized)
      const coords = [
        parseFloat(yMin), 
        parseFloat(xMin), 
        parseFloat(yMax), 
        parseFloat(xMax)
      ];
      
      // Determine if coordinates need normalization (using 1000 as the benchmark)
      // If any coordinate is > 1, we assume they're already in the 0-1000 range
      const needsNormalization = coords.some(coord => coord > 1);
      
      // If already normalized to 0-1000, use as is
      // Otherwise, multiply by 1000 to normalize to the expected range
      const normalizedCoords = needsNormalization 
        ? coords 
        : coords.map(coord => coord * 1000);
        
      tools.push({
        label: name.trim(),
        box_2d: normalizedCoords
      });
    }
  });
  
  // If we couldn't find coordinates, try to at least extract tool names
  if (tools.length === 0) {
    tools = parseToolsFromText(text);
    console.log(`Extracted ${tools.length} tool names without coordinates`);
  } else {
    console.log(`Extracted ${tools.length} tools with normalized coordinates`);
  }
  
  return { tools, raw_response };
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

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

    // Call Gemini API with simplified prompt - just "name items"
    console.log('Calling Gemini API...')
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: "name items" },
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
    
    // Log Gemini API response once with clear demarcation
    console.log('\n========== RAW GEMINI API RESPONSE ==========\n')
    console.log(text)
    console.log('\n=========== END GEMINI API RESPONSE ===========\n')
    
    // Extract tool data with normalized coordinates
    const { tools, raw_response } = extractToolData(text);
    
    // Return the processed results
    return new Response(
      JSON.stringify({
        raw_response,
        coordinate_system: {
          origin: "top-left",
          x_axis_direction: "left-to-right",
          y_axis_direction: "top-to-bottom"
        },
        tools
      }),
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
