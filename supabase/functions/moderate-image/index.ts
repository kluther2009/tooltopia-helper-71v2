
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const AZURE_ENDPOINT = 'https://checkimages.cognitiveservices.azure.com'
const AZURE_API_KEY = Deno.env.get('AZURE_CONTENT_MODERATOR_KEY')
const MAX_IMAGE_SIZE = 4 * 1024 * 1024 // 4MB in bytes

// Severity thresholds (0-6 scale, where 6 is most severe)
const SEVERITY_THRESHOLDS = {
  Hate: 2,      // Allow very mild content
  SelfHarm: 0,  // Zero tolerance
  Sexual: 0,    // Zero tolerance
  Violence: 2,  // Allow very mild content
}

interface CategoryAnalysis {
  category: keyof typeof SEVERITY_THRESHOLDS
  severity: number
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

async function compressImage(imageArrayBuffer: ArrayBuffer): Promise<Uint8Array> {
  // Convert to base64 for size check
  const bytes = new Uint8Array(imageArrayBuffer)
  if (bytes.length <= MAX_IMAGE_SIZE) {
    return bytes
  }

  // If image is too large, create a new ImageBitmap with reduced quality
  const blob = new Blob([imageArrayBuffer])
  const imageBitmap = await createImageBitmap(blob)
  
  // Create a canvas to draw and compress the image
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to create canvas context')
  }

  // Draw image on canvas
  ctx.drawImage(imageBitmap, 0, 0)

  // Convert to blob with reduced quality
  const compressedBlob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: 0.7
  })

  // Convert blob to array buffer
  return new Uint8Array(await compressedBlob.arrayBuffer())
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

    // Fetch image data
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    // Get image data and check size
    const imageArrayBuffer = await imageResponse.arrayBuffer()
    if (imageArrayBuffer.byteLength > MAX_IMAGE_SIZE * 2) { // If more than 8MB, reject immediately
      throw new Error('Image size exceeds maximum limit of 8MB')
    }

    // Compress image if needed
    const processedImageBytes = await compressImage(imageArrayBuffer)
    
    // Convert to base64
    let binary = ''
    for (let i = 0; i < processedImageBytes.length; i++) {
      binary += String.fromCharCode(processedImageBytes[i])
    }
    const base64String = btoa(binary)

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
      
      // Parse the error message to make it more user-friendly
      if (errorData.includes('exceeds the maximum limit')) {
        throw new Error('Image size is too large. Please try a smaller image or reduce the image quality.')
      }
      
      throw new Error('Failed to analyze image')
    }

    const analysisResult = await response.json()
    console.log('Moderation result:', analysisResult)

    // Check each category against its threshold
    const violations: string[] = []
    analysisResult.categoriesAnalysis.forEach((analysis: CategoryAnalysis) => {
      const threshold = SEVERITY_THRESHOLDS[analysis.category]
      if (analysis.severity > threshold) {
        violations.push(`${analysis.category} content detected (severity: ${analysis.severity})`)
      }
    })

    const isSafe = violations.length === 0
    const details = {
      categoriesAnalysis: analysisResult.categoriesAnalysis,
      violations: violations
    }

    return new Response(
      JSON.stringify({
        isSafe,
        details
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
