
import { useRef, useEffect, useState } from "react";
import { Annotation, CanvasCoordinates } from "./types";
import { drawImageOnCanvas, drawAnnotation, drawRectangle, setupCanvas } from "./canvasUtils";
import { useCanvasInteraction } from "./useCanvasInteraction";

interface AnnotationCanvasProps {
  imageUrl: string;
  onRectangleDrawn?: (coordinates: CanvasCoordinates) => void;
  existingAnnotations?: Annotation[];
  mode?: 'draw' | 'select' | 'drop';
  onAnnotationSelect?: (annotationId: string, isShiftKey: boolean) => void;
  selectedAnnotations?: string[];
  onAnnotationDrop?: (newCoordinates: Record<string, CanvasCoordinates>) => void;
}

export function AnnotationCanvas({ 
  imageUrl, 
  onRectangleDrawn, 
  existingAnnotations = [],
  mode = 'draw',
  onAnnotationSelect,
  selectedAnnotations = [],
  onAnnotationDrop
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
    mode,
    onRectangleDrawn: (coords) => {
      console.log('Rectangle drawn with coordinates:', coords);
      if (onRectangleDrawn) {
        console.log('Calling onRectangleDrawn with coordinates:', coords);
        onRectangleDrawn(coords);
      }
    },
    onAnnotationSelect,
    onAnnotationDrop,
    imageMetrics
  });

  // Load image and initialize canvas
  useEffect(() => {
    console.log('Loading image:', imageUrl);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [imageUrl]);

  // Redraw canvas when annotations change
  useEffect(() => {
    console.log('Existing annotations changed:', existingAnnotations);
    if (imageRef.current && existingAnnotations) {
      drawCanvas();
    }
  }, [existingAnnotations, selectedAnnotations]);

  // Handle window resize
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

    // Draw all existing annotations
    if (existingAnnotations && existingAnnotations.length > 0) {
      console.log('Drawing annotations:', existingAnnotations);
      existingAnnotations.forEach(annotation => {
        if (annotation.tool?.name) {
          drawAnnotation(ctx, annotation, metrics, selectedAnnotations.includes(annotation.id));
        }
      });
    }
  };

  const getCursorStyle = () => {
    switch (mode) {
      case 'select':
        return 'pointer';
      case 'drop':
        return 'copy';
      default:
        return 'crosshair';
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full touch-none`}
      style={{ cursor: getCursorStyle() }}
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
