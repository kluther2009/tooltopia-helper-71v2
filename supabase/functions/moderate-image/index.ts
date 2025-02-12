
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const AZURE_ENDPOINT = 'https://checkimages.cognitiveservices.azure.com'
const AZURE_API_KEY = Deno.env.get('AZURE_CONTENT_MODERATOR_KEY')
const MAX_SIZE = 4 * 1024 * 1024 // 4MB limit for Azure

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk_size = 8192; // Process 8KB at a time
  
  for (let i = 0; i < bytes.length; i += chunk_size) {
    const chunk = bytes.slice(i, i + chunk_size);
    binary += String.fromCharCode.apply(null, chunk);
  }
  
  return binary;
}

serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    console.log('Starting image moderation for URL:', imageUrl)

    // Fetch the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
    }

    // Get image data as arrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer()
    console.log('Image size:', imageBuffer.byteLength / 1024 / 1024, 'MB')

    // Check size limit
    if (imageBuffer.byteLength > MAX_SIZE) {
      throw new Error('Image size exceeds Azure\'s 4MB limit')
    }
    
    // Convert to base64
    const binaryString = arrayBufferToBase64(imageBuffer)
    const base64Image = btoa(binaryString)
    console.log('Successfully converted image to base64')

    // Log request body for debugging
    const requestBody = {
      image: {
        content: base64Image
      },
      categories: ['Hate', 'Sexual', 'Violence']
    }
    console.log('Sending request to Azure with body structure:', {
      ...requestBody,
      image: { content: 'base64_content_truncated' }
    })

    // Call Azure Content Safety API
    const azureResponse = await fetch(
      `${AZURE_ENDPOINT}/contentsafety/image:analyze?api-version=2023-10-01`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': AZURE_API_KEY!,
        },
        body: JSON.stringify(requestBody),
      }
    )

    const responseText = await azureResponse.text()
    console.log('Raw Azure response:', responseText)

    if (!azureResponse.ok) {
      console.error('Azure API error details:', {
        status: azureResponse.status,
        statusText: azureResponse.statusText,
        response: responseText,
        headers: Object.fromEntries(azureResponse.headers.entries())
      })
      throw new Error(`Azure API error: ${azureResponse.status} ${azureResponse.statusText} - ${responseText}`)
    }

    const analysisResult = JSON.parse(responseText)
    console.log('Azure API response:', analysisResult)

    // Check for violations
    const violations = []
    if (analysisResult.categoriesAnalysis) {
      for (const category of analysisResult.categoriesAnalysis) {
        if (category.severity >= 4) {
          violations.push(category.category)
        }
      }
    }

    return new Response(
      JSON.stringify({
        isSafe: violations.length === 0,
        details: {
          categoriesAnalysis: analysisResult.categoriesAnalysis || [],
          violations: violations
        }
      }),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Error in moderate-image function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred',
        details: {}
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})
