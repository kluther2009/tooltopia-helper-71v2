import { useRef, useEffect, useState } from "react"

interface Annotation {
  id: string
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
  tool: {
    name: string
  }
}

interface AnnotationCanvasProps {
  imageUrl: string
  onRectangleDrawn?: (coordinates: { x: number; y: number; width: number; height: number }) => void
  existingAnnotations?: Annotation[]
}

export function AnnotationCanvas({ imageUrl, onRectangleDrawn, existingAnnotations = [] }: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      imageRef.current = img
      drawImage()
    }
  }, [imageUrl])

  useEffect(() => {
    if (imageRef.current) {
      drawImage()
    }
  }, [existingAnnotations])

  const drawImage = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !imageRef.current) return

    const containerWidth = canvas.clientWidth
    const containerHeight = canvas.clientHeight
    canvas.width = containerWidth
    canvas.height = containerHeight

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

    // Draw existing annotations
    existingAnnotations.forEach(annotation => {
      const { coordinates, tool } = annotation
      
      // Draw rectangle
      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2
      ctx.strokeRect(
        coordinates.x,
        coordinates.y,
        coordinates.width,
        coordinates.height
      )

      // Draw tool name with background
      ctx.font = '14px Arial'
      const textMetrics = ctx.measureText(tool.name)
      const padding = 4
      const textHeight = 16 // Approximate height of the text
      
      // Draw background rectangle for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)' // Semi-transparent dark background
      ctx.fillRect(
        coordinates.x,
        coordinates.y - textHeight - padding * 2,
        textMetrics.width + padding * 2,
        textHeight + padding * 2
      )

      // Draw text
      ctx.fillStyle = '#ffffff' // White text
      ctx.fillText(
        tool.name,
        coordinates.x + padding,
        coordinates.y - padding
      )
    })
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

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top

    const coordinates = {
      x: Math.min(startPos.x, endX),
      y: Math.min(startPos.y, endY),
      width: Math.abs(endX - startPos.x),
      height: Math.abs(endY - startPos.y)
    }

    setIsDrawing(false)
    onRectangleDrawn?.(coordinates)
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsDrawing(false)}
    />
  )
}