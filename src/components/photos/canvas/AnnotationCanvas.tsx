import { useRef, useEffect, useState } from "react"

interface AnnotationCanvasProps {
  imageUrl: string
  onRectangleDrawn?: (coordinates: { x: number; y: number; width: number; height: number }) => void
}

export function AnnotationCanvas({ imageUrl, onRectangleDrawn }: AnnotationCanvasProps) {
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