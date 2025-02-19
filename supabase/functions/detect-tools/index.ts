
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
    
    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    console.log('Fetching image from URL:', imageUrl)

    // Get the image data
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
    }

    const arrayBuffer = await imageResponse.arrayBuffer()
    console.log('Image fetched successfully, size:', arrayBuffer.byteLength)
    
    // Convert array buffer to base64
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )
    console.log('Image converted to base64')

    // Initialize Gemini AI
    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY')
    if (!apiKey) {
      throw new Error('Google Cloud Vision API key not found')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

    // Prepare the prompt with specific instructions
    const prompt = "Identify diy tools, power tools, household hardware items, try and read any labels or stickers to add any other information. Return the response as a JSON array where each item has 'box_2d' (array of 4 numbers for x1,y1,x2,y2 coordinates) and 'label' (string describing the tool) properties."

    console.log('Calling Gemini API...')

    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64String
        }
      }
    ])

    const geminiResponse = await result.response
    const text = geminiResponse.text()

    console.log('Received Gemini response:', text)

    // Try to parse the response as JSON array
    let detectedItems
    try {
      detectedItems = JSON.parse(text)
      if (!Array.isArray(detectedItems)) {
        console.log('Response is not an array, wrapping in array')
        detectedItems = [detectedItems]
      }
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', e)
      // Create a basic response without bounding box if parsing fails
      detectedItems = [{
        box_2d: [0, 0, 0, 0],
        label: text
      }]
    }

    // Filter out non-tool items and format response
    const tools = detectedItems.filter(item => {
      const label = item.label.toLowerCase()
      return !label.includes('box') && 
             !label.includes('container') && 
             !label.includes('cup')
    })

    console.log('Filtered tools:', tools)

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
    console.error('Error in detect-tools function:', error)
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
