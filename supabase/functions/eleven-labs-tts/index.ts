import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()
    const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY')

    if (!apiKey) {
      throw new Error('Eleven Labs API key not configured')
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

    // Get the audio data and verify it's not empty
    const audioData = await response.arrayBuffer()
    if (audioData.byteLength === 0) {
      throw new Error('Received empty audio data from Eleven Labs')
    }

    console.log('Received audio data of size:', audioData.byteLength, 'bytes')

    // Create a Response with the audio data and proper headers
    const audioResponse = new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.byteLength.toString(),
      },
    })

    // Verify the response is valid
    if (!audioResponse.body) {
      throw new Error('Failed to create audio response')
    }

    return audioResponse
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