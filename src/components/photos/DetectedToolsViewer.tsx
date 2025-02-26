
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface Tool {
  label: string
  box_2d: number[]
}

interface DetectedToolsViewerProps {
  imageUrl: string
  detectedTools: Tool[]
  isOpen: boolean
  onClose: () => void
  onConfirm: (tools: Tool[]) => void
}

export function DetectedToolsViewer({ 
  imageUrl, 
  detectedTools, 
  isOpen, 
  onClose,
  onConfirm 
}: DetectedToolsViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !imageUrl || !canvasRef.current) {
      console.log('Early return:', { isOpen, imageUrl, hasCanvas: !!canvasRef.current })
      return
    }

    console.log('Starting image load process for:', imageUrl)
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setError('Failed to get canvas context')
      return
    }

    // Reset canvas and state
    setImageLoaded(false)
    setError(null)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Create new image object
    const image = new Image()
    imageRef.current = image
    
    image.crossOrigin = "anonymous"

    image.onload = () => {
      if (!canvas || !ctx) return
      
      console.log('Image loaded successfully:', {
        width: image.width,
        height: image.height,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
      })

      // Calculate dimensions maintaining aspect ratio
      const maxWidth = 800
      const maxHeight = 600
      let width = image.naturalWidth || image.width
      let height = image.naturalHeight || image.height
      const aspectRatio = width / height

      if (width > maxWidth) {
        width = maxWidth
        height = Math.round(width / aspectRatio)
      }

      if (height > maxHeight) {
        height = maxHeight
        width = Math.round(height * aspectRatio)
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      setImageDimensions({ width, height })

      // Draw background color
      ctx.fillStyle = '#f8f9fa'
      ctx.fillRect(0, 0, width, height)

      // Draw image
      try {
        ctx.drawImage(image, 0, 0, width, height)
        console.log('Image drawn to canvas successfully')

        // Calculate scale factors
        const scaleX = width / (image.naturalWidth || image.width)
        const scaleY = height / (image.naturalHeight || image.height)

        // Draw boxes and labels
        detectedTools.forEach((tool, index) => {
          const [x1, y1, x2, y2] = tool.box_2d
          
          // Scale coordinates
          const scaledX = x1 * scaleX
          const scaledY = y1 * scaleY
          const scaledWidth = (x2 - x1) * scaleX
          const scaledHeight = (y2 - y1) * scaleY

          // Draw box
          ctx.strokeStyle = '#00FF00'
          ctx.lineWidth = 2
          ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight)

          // Draw label
          const labelText = tool.label
          ctx.font = '16px Arial'
          const padding = 4
          const metrics = ctx.measureText(labelText)
          
          // Label background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.fillRect(
            scaledX,
            scaledY - 24,
            metrics.width + padding * 2,
            20
          )

          // Label text
          ctx.fillStyle = '#FFFFFF'
          ctx.fillText(labelText, scaledX + padding, scaledY - 10)
        })

        setImageLoaded(true)
      } catch (err) {
        console.error('Error drawing image:', err)
        setError('Failed to draw image to canvas')
      }
    }

    image.onerror = (err) => {
      console.error('Error loading image:', err)
      setError('Failed to load image')
      toast.error("Failed to load image")
    }

    // Add cache busting
    const url = new URL(imageUrl)
    url.searchParams.append('t', Date.now().toString())
    image.src = url.toString()

    // Cleanup
    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null
        imageRef.current.onerror = null
        imageRef.current = null
      }
    }
  }, [imageUrl, detectedTools, isOpen])

  const handleConfirm = () => {
    onConfirm(detectedTools)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detected Tools</DialogTitle>
        </DialogHeader>
        <div className="relative w-full flex flex-col items-center p-4">
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          <canvas 
            ref={canvasRef}
            className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm bg-gray-50"
            style={{
              width: imageDimensions.width > 0 ? `${imageDimensions.width}px` : 'auto',
              height: imageDimensions.height > 0 ? `${imageDimensions.height}px` : 'auto',
              display: 'block'
            }}
          />
          {!imageLoaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!imageLoaded}>
            Confirm Detections
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
