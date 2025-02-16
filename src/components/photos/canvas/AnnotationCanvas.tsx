
import { useRef, useEffect, useState } from "react";
import { Annotation, CanvasCoordinates } from "./types";
import { drawImageOnCanvas, drawAnnotation, drawRectangle } from "./canvasUtils";
import { useCanvasInteraction } from "./useCanvasInteraction";
import { Button } from "@/components/ui/button";
import { Trash2, Move } from "lucide-react";

interface AnnotationCanvasProps {
  imageUrl: string;
  onRectangleDrawn?: (coordinates: CanvasCoordinates) => void;
  existingAnnotations?: Annotation[];
  isDraggable?: boolean;
  isDropTarget?: boolean;
  onAnnotationDragEnd?: (annotation: Annotation, newCoordinates: CanvasCoordinates) => void;
  onAnnotationDelete?: (annotation: Annotation) => void;
  onAnnotationDragStart?: (annotation: Annotation) => void;
  draggedAnnotation?: Annotation | null;
  dragPreviewPos?: { x: number; y: number } | null;
  isReplacingPhoto?: boolean;
}

export function AnnotationCanvas({ 
  imageUrl, 
  onRectangleDrawn, 
  existingAnnotations = [],
  isDraggable = false,
  isDropTarget = false,
  onAnnotationDragEnd,
  onAnnotationDelete,
  onAnnotationDragStart,
  draggedAnnotation,
  dragPreviewPos,
  isReplacingPhoto = false
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
  const [selectedAnnotations, setSelectedAnnotations] = useState<Annotation[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const {
    isReadOnly,
    handleStart,
    handleMove,
    handleEnd,
    setIsDrawing,
    getMouseCoordinates
  } = useCanvasInteraction({
    canvasRef,
    onRectangleDrawn,
    imageMetrics,
    isReplacingPhoto
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
    if (imageRef.current && existingAnnotations) {
      drawCanvas();
    }
  }, [existingAnnotations, draggedAnnotation, dragPreviewPos]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageRef.current) return;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    // Draw image
    const metrics = drawImageOnCanvas(ctx, imageRef.current, canvas);
    setImageMetrics(metrics);

    // Draw existing annotations
    existingAnnotations.forEach(annotation => {
      if (annotation !== draggedAnnotation) {
        drawAnnotation(ctx, annotation, metrics);
      }
    });

    // Draw drag preview if applicable
    if (draggedAnnotation && dragPreviewPos && canvas.contains(document.elementFromPoint(dragPreviewPos.x, dragPreviewPos.y))) {
      const rect = canvas.getBoundingClientRect();
      const x = (dragPreviewPos.x - rect.left) * (canvas.width / rect.width / dpr);
      const y = (dragPreviewPos.y - rect.top) * (canvas.height / rect.height / dpr);

      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;

      const width = draggedAnnotation.coordinates.width * metrics.scale;
      const height = draggedAnnotation.coordinates.height * metrics.scale;

      ctx.strokeRect(
        x - width / 2,
        y - height / 2,
        width,
        height
      );

      // Draw tool name
      if (draggedAnnotation.tool?.name) {
        ctx.font = '14px Arial';
        const padding = 4;
        const textMetrics = ctx.measureText(draggedAnnotation.tool.name);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
          x - width / 2,
          y - height / 2 - 24,
          textMetrics.width + padding * 2,
          20
        );

        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          draggedAnnotation.tool.name,
          x - width / 2 + padding,
          y - height / 2 - 8
        );
      }

      ctx.restore();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggable || !imageMetrics) return;

    const coords = getMouseCoordinates(e.clientX, e.clientY);
    if (!coords) return;

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
      onAnnotationDragStart?.(clickedAnnotation);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggable || !imageMetrics) return;

    const coords = getMouseCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    const overAnnotation = existingAnnotations.some(annotation => {
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

    e.currentTarget.style.cursor = draggedAnnotation ? 'grabbing' : 
                                  overAnnotation ? 'grab' : 
                                  isDropTarget ? 'copy' : 'default';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedAnnotation && isDropTarget && imageMetrics) {
      const coords = getMouseCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      const newCoords = {
        x: (coords.x - imageMetrics.x) / imageMetrics.scale,
        y: (coords.y - imageMetrics.y) / imageMetrics.scale,
        width: draggedAnnotation.coordinates.width,
        height: draggedAnnotation.coordinates.height
      };

      onAnnotationDragEnd?.(draggedAnnotation, newCoords);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedAnnotations(selectAll ? [] : [...existingAnnotations]);
  };

  const handleDeleteSelected = () => {
    if (!onAnnotationDelete) return;
    
    selectedAnnotations.forEach(annotation => {
      onAnnotationDelete(annotation);
    });

    setSelectedAnnotations([]);
  };

  return (
    <div className="relative h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        style={{ cursor: isReplacingPhoto ? 'default' : 'crosshair' }}
        onMouseDown={isReplacingPhoto ? handleMouseDown : handleStart}
        onMouseMove={isReplacingPhoto ? handleMouseMove : (e) => {
          const moveResult = handleMove(e);
          if (moveResult) {
            drawCanvas();
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
              drawRectangle(ctx, moveResult.startPos, moveResult.currentPos);
            }
          }
        }}
        onMouseUp={isReplacingPhoto ? handleMouseUp : handleEnd}
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
      />
      {isDraggable && existingAnnotations.length > 0 && (
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <Move className="h-4 w-4" />
            {selectAll ? 'Deselect All' : 'Select All'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSelected}
            className="flex items-center gap-2"
            disabled={selectedAnnotations.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}
    </div>
  );
}
