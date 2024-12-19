import { useRef, useEffect } from "react";
import { Annotation, CanvasCoordinates } from "./types";
import { drawImageOnCanvas, drawAnnotation, drawRectangle } from "./canvasUtils";
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
  
  const {
    isReadOnly,
    handleStart,
    handleMove,
    handleEnd,
    setIsDrawing
  } = useCanvasInteraction({
    canvasRef,
    onRectangleDrawn
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

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageRef.current) return;

    drawImageOnCanvas(ctx, imageRef.current, canvas);

    existingAnnotations.forEach(annotation => {
      drawAnnotation(ctx, annotation);
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