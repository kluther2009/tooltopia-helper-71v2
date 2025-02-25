
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

  useEffect(() => {
    if (!isOpen || !imageUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = new Image()
    image.src = imageUrl
    image.onload = () => {
      // Set canvas size to match image
      canvas.width = image.width
      canvas.height = image.height

      // Draw image
      ctx.drawImage(image, 0, 0)

      // Draw boxes and labels for each detected tool
      ctx.strokeStyle = '#00FF00' // Green color
      ctx.lineWidth = 2
      ctx.font = '16px Arial'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)' // Background for text

      detectedTools.forEach(tool => {
        const [x, y, width, height] = tool.box_2d

        // Draw rectangle
        ctx.strokeRect(x, y, width - x, height - y)

        // Draw label background
        const padding = 4
        const textMetrics = ctx.measureText(tool.label)
        ctx.fillRect(
          x,
          y - 24,
          textMetrics.width + padding * 2,
          20
        )

        // Draw label text
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(tool.label, x + padding, y - 10)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)' // Reset for next iteration
      })

      setImageLoaded(true)
    }

    image.onerror = () => {
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detected Tools</DialogTitle>
        </DialogHeader>
        <div className="relative w-full overflow-auto">
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!imageLoaded}>
            Confirm Detections
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
