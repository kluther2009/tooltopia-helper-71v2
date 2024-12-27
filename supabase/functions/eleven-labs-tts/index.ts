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

    // Using the "Rachel" voice ID - one of Eleven Labs' default voices
    const voiceId = "21m00Tcm4TlvDq8ikWAM"

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
      const error = await response.json()
      console.error('Eleven Labs API Error:', error)
      throw new Error(error.detail?.message || 'Failed to generate speech')
    }

    const audioData = await response.arrayBuffer()
    
    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    console.error('Error in TTS function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})