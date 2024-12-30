import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()
    const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY')

    if (!apiKey) {
      throw new Error('Eleven Labs API key not configured')
    }

    if (!text) {
      throw new Error('No text provided for TTS conversion')
    }

    console.log('Converting text to speech:', text)

    const voiceId = "21m00Tcm4TlvDq8ikWAM"
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Eleven Labs API error:', errorData)
      throw new Error(errorData.detail?.message || `Failed to generate speech: ${response.statusText}`)
    }

    // Get the audio data as an ArrayBuffer
    const audioBuffer = await response.arrayBuffer()
    
    // Return the audio data with proper headers
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString()
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      }
    )
  }
})