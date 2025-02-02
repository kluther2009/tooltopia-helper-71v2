import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'No image URL provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Moderating image:', imageUrl)

    const moderatorKey = Deno.env.get('AZURE_CONTENT_MODERATOR_KEY')
    if (!moderatorKey) {
      throw new Error('Azure Content Moderator key not configured')
    }

    // Call Azure Content Moderator API with your specific endpoint
    const response = await fetch(
      'https://checkimages.cognitiveservices.azure.com/contentmoderator/moderate/v1.0/ProcessImage/Evaluate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': moderatorKey,
        },
        body: JSON.stringify({
          DataRepresentation: 'URL',
          Value: imageUrl,
        }),
      }
    )

    if (!response.ok) {
      console.error('Azure API error:', await response.text())
      throw new Error('Failed to moderate image')
    }

    const moderationResult = await response.json()
    console.log('Moderation result:', moderationResult)

    // Determine if the image is safe based on Azure's response
    const isAdult = moderationResult.IsImageAdultClassified
    const isRacy = moderationResult.IsImageRacyClassified
    const isSafe = !isAdult && !isRacy

    return new Response(
      JSON.stringify({
        isSafe,
        details: moderationResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in moderate-image function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})