
import { useRef, useEffect, useState } from "react";
import { Annotation, CanvasCoordinates } from "./types";
import { drawImageOnCanvas, drawAnnotation, drawRectangle, setupCanvas } from "./canvasUtils";
import { useCanvasInteraction } from "./useCanvasInteraction";

interface AnnotationCanvasProps {
  imageUrl: string;
  onRectangleDrawn?: (coordinates: CanvasCoordinates) => void;
  existingAnnotations?: Annotation[];
  isDraggable?: boolean;
  isDropTarget?: boolean;
  onAnnotationDragEnd?: (annotation: Annotation, newCoordinates: CanvasCoordinates) => void;
}

export function AnnotationCanvas({ 
  imageUrl, 
  onRectangleDrawn, 
  existingAnnotations = [],
  isDraggable = false,
  isDropTarget = false,
  onAnnotationDragEnd
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
  const [draggedAnnotation, setDraggedAnnotation] = useState<Annotation | null>(null);
  
  const {
    isReadOnly,
    handleStart,
    handleMove,
    handleEnd,
    setIsDrawing,
    getMouseCoordinates
  } = useCanvasInteraction({
    canvasRef,
    onRectangleDrawn: (coords) => {
      if (onRectangleDrawn) {
        onRectangleDrawn(coords);
      }
    },
    imageMetrics
  });

  // Load image and initialize canvas
  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [imageUrl]);

  // Redraw canvas when annotations change
  useEffect(() => {
    if (imageRef.current && existingAnnotations) {
      drawCanvas();
    }
  }, [existingAnnotations]);

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
      existingAnnotations.forEach(annotation => {
        if (annotation.tool?.name) {
          drawAnnotation(ctx, annotation, metrics);
        }
      });
    }
  };

  const handleAnnotationDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggable || !imageMetrics) return;

    const coords = getMouseCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    // Find if we're clicking on an annotation
    const clickedAnnotation = existingAnnotations.find(annotation => {
      const scaledCoords = {
        x: annotation.coordinates.x * imageMetrics.scale + imageMetrics.x,
        y: annotation.coordinates.y * imageMetrics.scale + imageMetrics.y,
        width: annotation.coordinates.width * imageMetrics.scale,
        height: annotation.coordinates.height * imageMetrics.scale
      };

      return (
        coords.x >= scaledCoords.x &&
        coords.x <= scaledCoords.x + scaledCoords.width &&
        coords.y >= scaledCoords.y &&
        coords.y <= scaledCoords.y + scaledCoords.height
      );
    });

    if (clickedAnnotation) {
      setDraggedAnnotation(clickedAnnotation);
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    if (!isDropTarget || !imageMetrics || !draggedAnnotation || !onAnnotationDragEnd) return;

    e.preventDefault();
    const coords = getMouseCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    // Convert coordinates back to relative position
    const newCoordinates = {
      x: (coords.x - imageMetrics.x) / imageMetrics.scale,
      y: (coords.y - imageMetrics.y) / imageMetrics.scale,
      width: draggedAnnotation.coordinates.width,
      height: draggedAnnotation.coordinates.height
    };

    onAnnotationDragEnd(draggedAnnotation, newCoordinates);
    setDraggedAnnotation(null);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${isReadOnly ? '' : 'cursor-crosshair'} touch-none`}
      onMouseDown={isDraggable ? handleAnnotationDrag : handleStart}
      onDragStart={(e) => {
        if (draggedAnnotation) {
          e.dataTransfer.setData('text/plain', 'annotation');
        }
      }}
      onDragOver={(e) => {
        if (isDropTarget) {
          e.preventDefault();
        }
      }}
      onDrop={handleDrop}
      draggable={!!draggedAnnotation}
      onMouseMove={(e) => {
        if (!isDraggable) {
          const moveResult = handleMove(e);
          if (moveResult) {
            drawCanvas();
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
              drawRectangle(ctx, moveResult.startPos, moveResult.currentPos);
            }
          }
        }
      }}
      onMouseUp={handleEnd}
      onMouseLeave={() => {
        setIsDrawing(false);
        setDraggedAnnotation(null);
      }}
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
