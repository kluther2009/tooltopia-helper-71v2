import { useRef, useEffect, useState } from "react";
import { Annotation, CanvasCoordinates } from "./types";
import { drawImageOnCanvas, drawAnnotation } from "./drawingUtils";

interface AnnotationCanvasProps {
  imageUrl: string;
  onRectangleDrawn?: (coordinates: CanvasCoordinates) => void;
  existingAnnotations?: Annotation[];
}

export function AnnotationCanvas({ 
  imageUrl, 
  onRectangleDrawn, 
  existingAnnotations = [] 
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (imageRef.current) {
      drawCanvas();
    }
  }, [existingAnnotations]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageRef.current) return;

    drawImageOnCanvas(ctx, imageRef.current, canvas);

    existingAnnotations.forEach(annotation => {
      drawAnnotation(ctx, annotation);
    });
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    return null;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    setStartPos(coords);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPos || !canvasRef.current) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCanvas();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      startPos.x,
      startPos.y,
      coords.x - startPos.x,
      coords.y - startPos.y
    );
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPos || !canvasRef.current) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const coordinates = {
      x: Math.min(startPos.x, coords.x),
      y: Math.min(startPos.y, coords.y),
      width: Math.abs(coords.x - startPos.x),
      height: Math.abs(coords.y - startPos.y)
    };

    setIsDrawing(false);
    setStartPos(null);
    onRectangleDrawn?.(coordinates);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair touch-none"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={() => setIsDrawing(false)}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={() => setIsDrawing(false)}
    />
  );
}