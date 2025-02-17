
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from "npm:@google/generative-ai"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Get the image data
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    
    // Convert array buffer to base64
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

    // Prepare the prompt
    const prompt = "Analyze this image and list any tools or equipment you can see. For each tool, describe its location in the image. Format the response as a JSON array where each object has 'tool' and 'location' properties."

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

    const response = await result.response
    const text = response.text()

    console.log('Gemini response:', text)

    // Try to parse the response as JSON, if it's not valid JSON, wrap it in an array
    let tools
    try {
      tools = JSON.parse(text)
    } catch (e) {
      tools = [{
        tool: "Unknown",
        location: text
      }]
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
    console.error('Error in detect-tools function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
