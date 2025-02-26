
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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!isOpen || !imageUrl || !canvasRef.current) {
      console.log('Early return:', { isOpen, imageUrl, hasCanvas: !!canvasRef.current })
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Failed to get canvas context')
      return
    }

    console.log('Starting image load process for:', imageUrl)
    
    // Reset state
    setImageLoaded(false)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Create new image object
    const image = new Image()
    
    // Important: Set crossOrigin before src
    image.crossOrigin = "anonymous"

    image.onload = () => {
      console.log('Image loaded successfully:', {
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
      })
      
      // Calculate dimensions
      const maxWidth = 800
      const maxHeight = 600
      let width = image.naturalWidth
      let height = image.naturalHeight
      const aspectRatio = width / height

      if (width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
      }

      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }

      console.log('Calculated dimensions:', { width, height })

      // Update canvas size
      canvas.width = width
      canvas.height = height
      setImageDimensions({ width, height })

      // Draw scaled image
      ctx.drawImage(image, 0, 0, width, height)

      // Calculate scale factors
      const scaleX = width / image.naturalWidth
      const scaleY = height / image.naturalHeight

      console.log('Drawing bounding boxes for', detectedTools.length, 'tools')

      // Draw boxes and labels
      detectedTools.forEach((tool, index) => {
        const [x, y, w, h] = tool.box_2d
        
        // Scale coordinates
        const scaledX = x * scaleX
        const scaledY = y * scaleY
        const scaledW = w * scaleX
        const scaledH = h * scaleY

        console.log(`Drawing box ${index + 1}:`, {
          original: { x, y, w, h },
          scaled: { x: scaledX, y: scaledY, w: scaledW, h: scaledH }
        })

        // Draw rectangle
        ctx.strokeStyle = '#00FF00'
        ctx.lineWidth = 2
        ctx.strokeRect(scaledX, scaledY, scaledW - scaledX, scaledH - scaledY)

        // Draw label background
        ctx.font = '16px Arial'
        const padding = 4
        const textMetrics = ctx.measureText(tool.label)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(
          scaledX,
          scaledY - 24,
          textMetrics.width + padding * 2,
          20
        )

        // Draw label text
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(tool.label, scaledX + padding, scaledY - 10)
      })

      setImageLoaded(true)
      console.log('Finished drawing image and annotations')
    }

    image.onerror = (error) => {
      console.error('Error loading image:', error)
      toast.error("Failed to load image")
      onClose()
    }

    // Add timestamp to bust cache and debug query parameters
    const timestamp = new Date().getTime()
    const urlWithParams = `${imageUrl}?t=${timestamp}&debug=true`
    console.log('Loading image with URL:', urlWithParams)
    
    // Set src after all handlers are set up
    image.src = urlWithParams

  }, [imageUrl, detectedTools, isOpen])

  const handleConfirm = () => {
    onConfirm(detectedTools)
    toast.success("Tool detection data saved")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detected Tools</DialogTitle>
        </DialogHeader>
        <div className="relative w-full flex justify-center p-4">
          <canvas 
            ref={canvasRef}
            className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm bg-gray-50"
            style={{
              width: imageDimensions.width > 0 ? `${imageDimensions.width}px` : 'auto',
              height: imageDimensions.height > 0 ? `${imageDimensions.height}px` : 'auto',
              display: 'block' // Ensure canvas is visible
            }}
          />
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
