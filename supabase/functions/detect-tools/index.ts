
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
    // Parse request body
    let body;
    try {
      body = await req.json()
      console.log('Request body:', body)
    } catch (e) {
      console.error('Error parsing request body:', e)
      throw new Error('Invalid request body')
    }

    const { imageUrl } = body
    console.log('Image URL:', imageUrl)
    
    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    // Initialize Gemini AI
    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY')
    if (!apiKey) {
      console.error('GOOGLE_CLOUD_VISION_API_KEY not found')
      throw new Error('API key not configured')
    }

    console.log('Initializing Gemini...')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

    // Fetch image
    console.log('Fetching image from URL:', imageUrl)
    const imgResponse = await fetch(imageUrl)
    if (!imgResponse.ok) {
      console.error('Image fetch failed:', imgResponse.status, imgResponse.statusText)
      throw new Error(`Failed to fetch image: ${imgResponse.status}`)
    }

    // Process image
    const imageBuffer = await imgResponse.arrayBuffer()
    console.log('Image buffer size:', imageBuffer.byteLength)
    
    if (imageBuffer.byteLength === 0) {
      throw new Error('Image buffer is empty')
    }

    try {
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
      console.log('Successfully converted image to base64')

      // Call Gemini API
      console.log('Sending request to Gemini...')
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        "Identify and list all tools, power tools, and hardware items visible in this image. Format your response as a JSON array where each object has 'box_2d' (array of 4 coordinates [x1,y1,x2,y2]) and 'label' (string describing the tool)."
      ])

      const response = await result.response
      const text = response.text()
      console.log('Raw Gemini response:', text)

      // Parse response
      let tools = []
      try {
        const jsonMatch = text.match(/\[.*?\]/s)
        if (jsonMatch) {
          tools = JSON.parse(jsonMatch[0])
        } else {
          console.log('No JSON array found in response, trying to parse full text')
          tools = JSON.parse(text)
        }

        if (!Array.isArray(tools)) {
          console.log('Converting single tool to array')
          tools = [tools]
        }

        tools = tools.filter(item => {
          const isValid = item && 
                         typeof item.label === 'string' && 
                         Array.isArray(item.box_2d) && 
                         item.box_2d.length === 4
          if (!isValid) {
            console.log('Filtered out invalid tool:', item)
          }
          return isValid
        })

        console.log('Final processed tools:', tools)
      } catch (e) {
        console.error('Error parsing Gemini response:', e)
        console.log('Raw text that failed to parse:', text)
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
    } catch (e) {
      console.error('Error in image processing or API call:', e)
      throw e
    }
  } catch (error) {
    console.error('Top-level error:', error)
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
