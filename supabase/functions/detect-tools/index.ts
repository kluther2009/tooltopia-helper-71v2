
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

    // Call Gemini API with corrected structure
    console.log('Calling Gemini API...')
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: "Identify and list all tools, power tools, and hardware items visible in this image. Format your response as a JSON array where each object has 'box_2d' (array of 4 coordinates [x1,y1,x2,y2]) and 'label' (string describing the tool)." },
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
    console.log('Raw response:', text)

    // Parse response
    let tools = []
    try {
      const jsonMatch = text.match(/\[.*?\]/s)
      if (jsonMatch) {
        tools = JSON.parse(jsonMatch[0])
      } else {
        tools = JSON.parse(text)
      }

      if (!Array.isArray(tools)) {
        tools = [tools]
      }

      tools = tools.filter(item => {
        return item && 
               typeof item.label === 'string' && 
               Array.isArray(item.box_2d) && 
               item.box_2d.length === 4
      })

      console.log('Processed tools:', tools)
    } catch (e) {
      console.error('Error parsing response:', e)
      throw new Error(`Failed to parse tool detection results: ${e.message}`)
    }

    return new Response(
      JSON.stringify({ tools }),
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
