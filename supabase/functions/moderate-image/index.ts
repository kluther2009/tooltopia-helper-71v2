
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

// Bypass all moderation logic and always return isSafe: true
serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()
    // Still require the imageUrl, but ignore moderation and return isSafe: true
    return new Response(
      JSON.stringify({
        isSafe: true,
        details: {
          bypassed: true,
          message: "Moderation temporarily disabled; image auto-approved."
        }
      }),
      { headers: corsHeaders }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred (bypass mode)',
        details: { bypassed: true }
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})
