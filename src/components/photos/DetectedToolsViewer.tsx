
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
    if (!isOpen || !imageUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    console.log('Loading image with URL:', imageUrl)
    console.log('Detected tools:', detectedTools)

    const image = new Image()
    image.crossOrigin = "anonymous"  // Add this to handle CORS
    image.src = imageUrl

    image.onload = () => {
      // Get the original image dimensions
      const originalWidth = image.width
      const originalHeight = image.height

      // Calculate scaling to fit within a reasonable size while maintaining aspect ratio
      const maxWidth = 800
      const maxHeight = 600
      let width = originalWidth
      let height = originalHeight

      if (width > maxWidth) {
        const ratio = maxWidth / width
        width = maxWidth
        height = height * ratio
      }

      if (height > maxHeight) {
        const ratio = maxHeight / height
        height = maxHeight
        width = width * ratio
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      setImageDimensions({ width, height })

      // Clear previous content
      ctx.clearRect(0, 0, width, height)

      // Draw scaled image
      ctx.drawImage(image, 0, 0, width, height)

      // Calculate scale factors for bounding boxes
      const scaleX = width / originalWidth
      const scaleY = height / originalHeight

      // Draw boxes and labels for each detected tool
      ctx.strokeStyle = '#00FF00' // Green color
      ctx.lineWidth = 2
      ctx.font = '16px Arial'

      detectedTools.forEach(tool => {
        const [x, y, w, h] = tool.box_2d
        
        // Scale coordinates
        const scaledX = x * scaleX
        const scaledY = y * scaleY
        const scaledW = w * scaleX
        const scaledH = h * scaleY

        // Draw rectangle
        ctx.strokeRect(scaledX, scaledY, scaledW - scaledX, scaledH - scaledY)

        // Draw label background
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
    }

    image.onerror = (error) => {
      console.error('Error loading image:', error)
      toast.error("Failed to load image")
      onClose()
    }
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
            className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm"
            style={{
              width: imageDimensions.width > 0 ? `${imageDimensions.width}px` : 'auto',
              height: imageDimensions.height > 0 ? `${imageDimensions.height}px` : 'auto'
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
