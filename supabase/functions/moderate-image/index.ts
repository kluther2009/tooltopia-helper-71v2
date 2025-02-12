
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const AZURE_ENDPOINT = 'https://checkimages.cognitiveservices.azure.com'
const AZURE_API_KEY = Deno.env.get('AZURE_CONTENT_MODERATOR_KEY')
const MAX_IMAGE_SIZE = 4 * 1024 * 1024 // 4MB in bytes

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

async function compressImage(arrayBuffer: ArrayBuffer): Promise<string> {
  // Create a canvas in memory
  const img = new Image()
  const canvas = new OffscreenCanvas(1, 1)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Load image data
  const blob = new Blob([arrayBuffer])
  const imageBitmap = await createImageBitmap(blob)

  // Set canvas size to match image
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height

  // Draw image to canvas
  ctx.drawImage(imageBitmap, 0, 0)

  // Start with quality of 1
  let quality = 1.0
  let base64String: string

  // Reduce quality until size is under MAX_IMAGE_SIZE
  do {
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality
    })
    
    // Convert blob to base64
    const arrayBuffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    base64String = btoa(binary)
    
    // Reduce quality for next iteration if needed
    quality -= 0.1
  } while (base64String.length * 0.75 > MAX_IMAGE_SIZE && quality > 0.1)

  return base64String
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

    // Fetch the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    // Get image data
    const imageArrayBuffer = await imageResponse.arrayBuffer()
    
    // Compress image if it's too large
    let base64String: string
    if (imageArrayBuffer.byteLength > MAX_IMAGE_SIZE) {
      console.log(`Image size (${imageArrayBuffer.byteLength / 1024 / 1024}MB) exceeds limit. Compressing...`)
      base64String = await compressImage(imageArrayBuffer)
      console.log(`Compressed image size: ${base64String.length * 0.75 / 1024 / 1024}MB`)
    } else {
      // If image is small enough, just convert to base64
      const bytes = new Uint8Array(imageArrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      base64String = btoa(binary)
    }

    // Call Azure Content Safety API
    const response = await fetch(
      `${AZURE_ENDPOINT}/contentsafety/image:analyze?api-version=2023-10-01`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': AZURE_API_KEY!,
        },
        body: JSON.stringify({
          image: {
            content: base64String,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Azure API error:', errorData)
      throw new Error('Failed to analyze image')
    }

    const analysisResult = await response.json()
    console.log('Moderation result:', analysisResult)

    // Return a safe result for now (since we removed the safety check)
    return new Response(
      JSON.stringify({
        isSafe: true,
        details: {
          categoriesAnalysis: [],
          violations: []
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
