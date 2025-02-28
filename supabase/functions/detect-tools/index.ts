
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('Received image URL:', imageUrl.substring(0, 50) + '...')

    // Fetch image as binary data
    console.log('Fetching image...')
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status, imageResponse.statusText)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch image' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const imageBlob = await imageResponse.blob()
    console.log('Image fetched, size:', imageBlob.size, 'bytes')

    // Convert blob to base64
    const arrayBuffer = await imageBlob.arrayBuffer()
    const imageBase64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )

    // Initialize Gemini API
    console.log('Initializing Gemini API...')
    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY')
    if (!apiKey) {
      console.error('Missing GOOGLE_CLOUD_VISION_API_KEY')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

    // Updated system prompt for tool detection with 2D bounding box coordinates
    const systemPrompt = `You are a computer vision expert specializing in identifying tools in workshop and garage settings.
When presented with an image, carefully analyze it and identify all visible tools, return the 2d bounding box coordinates. If no tools are visible, return an empty array.`

    console.log('Sending request to Gemini API...')
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { 
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64
              }
            },
            { text: `Identify all tools in this image. Format your response as a JSON object with a "tools" array containing objects with "label" (the tool name) and "box_2d" (array of normalized coordinates [y_min, x_min, y_max, x_max] on a 0-1000 scale where (0,0) is top-left).` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      }
    })

    const response = result.response
    const text = response.text()
    console.log('Received response from Gemini API')

    // Extract JSON data from the response
    let tools = []
    try {
      // Try to parse the entire response as JSON
      const parsedData = JSON.parse(text)
      tools = parsedData.tools || []
      console.log(`Successfully parsed JSON, found ${tools.length} tools`)
    } catch (e) {
      console.error('Failed to parse response as JSON, attempting to extract JSON block:', e)
      
      // Try to extract a JSON block from text response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) ||
                        text.match(/{[\s\S]*?}/)
      
      if (jsonMatch) {
        try {
          const jsonString = jsonMatch[1] || jsonMatch[0]
          const parsedData = JSON.parse(jsonString)
          tools = parsedData.tools || []
          console.log(`Extracted JSON from code block, found ${tools.length} tools`)
        } catch (jsonError) {
          console.error('Failed to parse extracted JSON:', jsonError)
        }
      }
    }

    console.log('Detected tools:', tools)

    return new Response(
      JSON.stringify({ tools }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
