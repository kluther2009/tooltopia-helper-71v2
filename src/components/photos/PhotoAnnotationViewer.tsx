import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LocationPhoto } from "@/types/photos"
import { supabase } from "@/integrations/supabase/client"

interface PhotoAnnotationViewerProps {
  photo: LocationPhoto | null
  isOpen: boolean
  onClose: () => void
}

export function PhotoAnnotationViewer({ photo, isOpen, onClose }: PhotoAnnotationViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (photo && isOpen) {
      const img = new Image()
      img.src = `${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`
      img.onload = () => {
        imageRef.current = img
        setImageLoaded(true)
        drawImage()
      }
    } else {
      setImageLoaded(false)
      imageRef.current = null
    }
  }, [photo, isOpen])

  const drawImage = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !imageRef.current) return

    const containerWidth = canvas.clientWidth
    const containerHeight = canvas.clientHeight
    canvas.width = containerWidth
    canvas.height = containerHeight

    // Calculate scaling to fit image while maintaining aspect ratio
    const scale = Math.min(
      containerWidth / imageRef.current.width,
      containerHeight / imageRef.current.height
    )
    const scaledWidth = imageRef.current.width * scale
    const scaledHeight = imageRef.current.height * scale
    const x = (containerWidth - scaledWidth) / 2
    const y = (containerHeight - scaledHeight) / 2

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(imageRef.current, x, y, scaledWidth, scaledHeight)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDrawing(true)
    setStartPos({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    // Redraw the image and current rectangle
    drawImage()
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 2
    ctx.strokeRect(
      startPos.x,
      startPos.y,
      currentX - startPos.x,
      currentY - startPos.y
    )
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    // Here we'll later add the logic to show the tool selection dialog
  }

  if (!photo || !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
        <div className="relative w-full h-[80vh]">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDrawing(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}