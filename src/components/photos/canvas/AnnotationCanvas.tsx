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
  const [hoveredToolId, setHoveredToolId] = useState<string | null>(null);
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
    onRectangleDrawn: (coords) => {
      console.log('Rectangle drawn with coordinates:', coords);
      if (onRectangleDrawn) {
        console.log('Calling onRectangleDrawn with coordinates:', coords);
        onRectangleDrawn(coords);
      }
    },
    imageMetrics,
    hoveredToolId
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

  // Redraw canvas when annotations change or tool is hovered
  useEffect(() => {
    console.log('Existing annotations changed or tool hovered:', existingAnnotations);
    if (imageRef.current && existingAnnotations) {
      drawCanvas();
    }
  }, [existingAnnotations, hoveredToolId]);

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

  const isPointInAnnotation = (x: number, y: number, annotation: Annotation) => {
    if (!imageMetrics) return false;
    
    const scaledX = (x - imageMetrics.x) / imageMetrics.scale;
    const scaledY = (y - imageMetrics.y) / imageMetrics.scale;
    
    return (
      scaledX >= annotation.coordinates.x &&
      scaledX <= annotation.coordinates.x + annotation.coordinates.width &&
      scaledY >= annotation.coordinates.y &&
      scaledY <= annotation.coordinates.y + annotation.coordinates.height
    );
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !existingAnnotations) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundTool = false;
    for (const annotation of existingAnnotations) {
      if (isPointInAnnotation(x, y, annotation)) {
        setHoveredToolId(annotation.tool_id);
        foundTool = true;
        break;
      }
    }

    if (!foundTool) {
      setHoveredToolId(null);
    }

    const moveResult = handleMove(e);
    if (moveResult) {
      drawCanvas();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawRectangle(ctx, moveResult.startPos, moveResult.currentPos);
      }
    }
  };

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
          const isHighlighted = hoveredToolId === annotation.tool_id;
          drawAnnotation(ctx, annotation, metrics, isHighlighted);
        }
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${isReadOnly ? '' : 'cursor-crosshair'} touch-none`}
      onMouseDown={handleStart}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={() => {
        setHoveredToolId(null);
        setIsDrawing(false);
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