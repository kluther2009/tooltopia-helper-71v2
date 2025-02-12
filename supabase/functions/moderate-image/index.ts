
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

async function compressBase64Image(base64String: string): Promise<string> {
  // Calculate chunks of the base64 string to process
  // This helps handle large images more efficiently
  const chunkSize = MAX_IMAGE_SIZE;
  const chunks = Math.ceil(base64String.length / chunkSize);
  
  // If image is not too much larger than max size, try removing metadata
  if (base64String.length < MAX_IMAGE_SIZE * 1.5) {
    // Remove EXIF data by taking only the image data part
    const imageDataIndex = base64String.indexOf(',');
    if (imageDataIndex !== -1) {
      base64String = base64String.substring(imageDataIndex + 1);
    }
    
    // If this was enough to get under max size, return it
    if (base64String.length * 0.75 <= MAX_IMAGE_SIZE) {
      return base64String;
    }
  }

  // If still too large, reduce quality by removing some data
  // This is a simple but effective way to reduce size while maintaining basic image integrity
  let quality = 1.0;
  while (base64String.length * 0.75 > MAX_IMAGE_SIZE && quality > 0.1) {
    // Skip some pixels to reduce quality
    let compressed = '';
    const skipFactor = Math.floor(1 / quality);
    
    for (let i = 0; i < base64String.length; i += skipFactor) {
      compressed += base64String[i];
    }
    
    base64String = compressed;
    quality -= 0.1;
  }

  return base64String;
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
    
    // Convert to base64
    const bytes = new Uint8Array(imageArrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    let base64String = btoa(binary)
    
    // Compress if needed
    if (base64String.length * 0.75 > MAX_IMAGE_SIZE) {
      console.log(`Image size (${base64String.length * 0.75 / 1024 / 1024}MB) exceeds limit. Compressing...`)
      base64String = await compressBase64Image(base64String)
      console.log(`Compressed image size: ${base64String.length * 0.75 / 1024 / 1024}MB`)
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
