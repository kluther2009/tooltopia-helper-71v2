
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

    // Get the image data
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }

    const arrayBuffer = await imageResponse.arrayBuffer()
    console.log('Image size:', arrayBuffer.byteLength)

    // Convert array buffer to base64
    const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // Initialize Gemini AI
    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY')
    if (!apiKey) {
      throw new Error('GOOGLE_CLOUD_VISION_API_KEY not found')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

    console.log('Sending request to Gemini API')
    
    // Call Gemini API
    const result = await model.generateContent([
      "Identify diy tools, power tools, household hardware items, try and read any labels or stickers to add any other information. Return the response as a JSON array where each item has 'box_2d' (array of 4 numbers for x1,y1,x2,y2 coordinates) and 'label' (string describing the tool) properties.",
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64String
        }
      }
    ])

    const geminiResponse = await result.response
    const text = geminiResponse.text()
    console.log('Raw Gemini response:', text)

    // Try to extract JSON from the response
    let detectedItems = []
    try {
      const matches = text.match(/\[.*\]/s) // Match everything between [ and ] including newlines
      if (matches) {
        detectedItems = JSON.parse(matches[0])
      } else {
        // Try to parse the whole response as JSON
        detectedItems = JSON.parse(text)
      }
    } catch (e) {
      console.error('JSON parsing error:', e)
      throw new Error('Failed to parse Gemini response as JSON')
    }

    if (!Array.isArray(detectedItems)) {
      detectedItems = [detectedItems]
    }

    // Filter out non-tool items
    const tools = detectedItems.filter(item => {
      if (!item || typeof item.label !== 'string') return false
      const label = item.label.toLowerCase()
      return !label.includes('box') && 
             !label.includes('container') && 
             !label.includes('cup')
    })

    console.log('Detected tools:', tools)

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
