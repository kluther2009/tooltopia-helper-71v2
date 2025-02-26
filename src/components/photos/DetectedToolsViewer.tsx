
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
    
    // Reset state
    setImageLoaded(false)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const image = new Image()
    image.crossOrigin = "anonymous"

    // Set up onload before setting src
    image.onload = () => {
      console.log('Image loaded successfully:', image.width, 'x', image.height)
      
      // Calculate dimensions
      const maxWidth = 800
      const maxHeight = 600
      let width = image.width
      let height = image.height
      const aspectRatio = width / height

      if (width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
      }

      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }

      // Update canvas size
      canvas.width = width
      canvas.height = height
      setImageDimensions({ width, height })

      // Draw scaled image
      ctx.drawImage(image, 0, 0, width, height)

      // Calculate scale factors
      const scaleX = width / image.width
      const scaleY = height / image.height

      // Draw boxes and labels
      ctx.strokeStyle = '#00FF00'
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

    // Add timestamp to bust cache
    const timestamp = new Date().getTime()
    const urlWithCache = `${imageUrl}?t=${timestamp}`
    console.log('Loading image with cache buster:', urlWithCache)
    image.src = urlWithCache

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
