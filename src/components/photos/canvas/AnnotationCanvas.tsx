import { useRef, useEffect, useState } from "react";
import { Annotation, CanvasCoordinates } from "./types";
import { drawImageOnCanvas, drawAnnotation, drawRectangle, setupCanvas } from "./canvasUtils";
import { useCanvasInteraction } from "./useCanvasInteraction";

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
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageMetrics, setImageMetrics] = useState<{
    scale: number;
    x: number;
    y: number;
    scaledWidth: number;
    scaledHeight: number;
  } | null>(null);
  
  const {
    isReadOnly,
    handleStart,
    handleMove,
    handleEnd,
    setIsDrawing
  } = useCanvasInteraction({
    canvasRef,
    onRectangleDrawn,
    imageMetrics
  });

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

  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        drawCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = setupCanvas(canvas, canvas.clientWidth, canvas.clientHeight);
    if (!ctx) return;

    const metrics = drawImageOnCanvas(ctx, imageRef.current, canvas);
    setImageMetrics(metrics);

    existingAnnotations.forEach(annotation => {
      drawAnnotation(ctx, annotation, metrics);
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${isReadOnly ? '' : 'cursor-crosshair'} touch-none`}
      onMouseDown={handleStart}
      onMouseMove={(e) => {
        const moveResult = handleMove(e);
        if (moveResult) {
          drawCanvas();
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx) {
            drawRectangle(ctx, moveResult.startPos, moveResult.currentPos);
          }
        }
      }}
      onMouseUp={handleEnd}
      onMouseLeave={() => setIsDrawing(false)}
      onTouchStart={handleStart}
      onTouchMove={(e) => {
        e.preventDefault();
        const moveResult = handleMove(e);
        if (moveResult) {
          drawCanvas();
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx) {
            drawRectangle(ctx, moveResult.startPos, moveResult.currentPos);
          }
        }
      }}
      onTouchEnd={handleEnd}
      onTouchCancel={() => setIsDrawing(false)}
    />
  );
}