import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Fetch the image data
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    // Convert image to base64 using TextEncoder
    const imageArrayBuffer = await imageResponse.arrayBuffer()
    const bytes = new Uint8Array(imageArrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64String = btoa(binary)

    // Call Azure Content Safety API
    const response = await fetch(
      'https://checkimages.cognitiveservices.azure.com/contentsafety/image:analyze?api-version=2023-10-01',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': moderatorKey,
        },
        body: JSON.stringify({
          image: {
            content: base64String
          },
          categories: ["Hate", "SelfHarm", "Sexual", "Violence"]
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Azure API error:', errorText)
      throw new Error(`Azure API returned ${response.status}: ${errorText}`)
    }

    const moderationResult = await response.json()
    console.log('Moderation result:', moderationResult)

    // Check if any category has a severity higher than "Low" (0)
    const isSafe = !moderationResult.categoriesAnalysis?.some(
      (category: { severity: number }) => category.severity > 0
    )

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
      JSON.stringify({ 
        error: error.message || 'Failed to moderate image',
        details: error
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})