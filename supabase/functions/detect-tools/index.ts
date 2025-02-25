
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

    try {
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

      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
      console.log('Image converted to base64')

      // Call Gemini API with the processed image
      console.log('Calling Gemini API...')
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        "Identify and list all tools, power tools, and hardware items visible in this image. For each item, please specify its location in the image using coordinates [x1,y1,x2,y2] and provide a detailed description. Format the response as a JSON array where each object has 'box_2d' (array of 4 numbers for coordinates) and 'label' (string describing the tool)."
      ])

      console.log('Got result from Gemini')
      const geminiResponse = await result.response
      console.log('Response object:', geminiResponse)
      const text = geminiResponse.text()
      console.log('Response text:', text)

      // Parse the response
      let tools = []
      try {
        // Try to find JSON array in the response
        const matches = text.match(/\[.*\]/s)
        if (matches) {
          tools = JSON.parse(matches[0])
        } else {
          // If no array found, try parsing the entire response
          tools = JSON.parse(text)
        }

        // Ensure we have an array
        if (!Array.isArray(tools)) {
          tools = [tools]
        }

        // Filter and validate each tool entry
        tools = tools.filter(item => {
          return item && 
                 typeof item.label === 'string' && 
                 Array.isArray(item.box_2d) && 
                 item.box_2d.length === 4
        })

      } catch (e) {
        console.error('JSON parsing error:', e)
        throw new Error(`Failed to parse tool detection results: ${e.message}`)
      }

      console.log('Processed tools:', tools)

      return new Response(
        JSON.stringify({ tools }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (innerError) {
      console.error('Inner error:', innerError)
      throw innerError // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
        type: error.constructor.name
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
