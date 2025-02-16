import { useRef, useEffect, useState } from "react";
import { Annotation, CanvasCoordinates } from "./types";
import { drawImageOnCanvas, drawAnnotation, drawRectangle, setupCanvas } from "./canvasUtils";
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
  onAnnotationDragStart?: (annotation: Annotation, startPos: { x: number; y: number }) => void;
  draggedAnnotation?: Annotation | null;
  mousePos?: { x: number; y: number } | null;
  dragStartPos?: { x: number; y: number } | null;
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
  mousePos,
  dragStartPos
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
    isDrawing,
    startPos,
    isReadOnly,
    handleStart,
    handleMove,
    handleEnd,
    setIsDrawing,
    getMouseCoordinates
  } = useCanvasInteraction({
    canvasRef,
    onRectangleDrawn: isDraggable ? undefined : onRectangleDrawn,
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
    if (imageRef.current && existingAnnotations) {
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

    if (existingAnnotations && existingAnnotations.length > 0) {
      existingAnnotations.forEach(annotation => {
        if (annotation.tool?.name) {
          drawAnnotation(ctx, annotation, metrics);
        }
      });
    }
  };

  const isResizeHandle = (annotation: Annotation, x: number, y: number, handle: 'se' | 'sw' | 'ne' | 'nw') => {
    if (!imageMetrics) return false;
    const handleSize = 10;
    const scaled = {
      x: annotation.coordinates.x * imageMetrics.scale + imageMetrics.x,
      y: annotation.coordinates.y * imageMetrics.scale + imageMetrics.y,
      width: annotation.coordinates.width * imageMetrics.scale,
      height: annotation.coordinates.height * imageMetrics.scale
    };

    const handles = {
      se: { x: scaled.x + scaled.width, y: scaled.y + scaled.height },
      sw: { x: scaled.x, y: scaled.y + scaled.height },
      ne: { x: scaled.x + scaled.width, y: scaled.y },
      nw: { x: scaled.x, y: scaled.y }
    };

    const handlePos = handles[handle];
    return (
      x >= handlePos.x - handleSize/2 &&
      x <= handlePos.x + handleSize/2 &&
      y >= handlePos.y - handleSize/2 &&
      y <= handlePos.y + handleSize/2
    );
  };

  const isOverAnnotation = (x: number, y: number, annotation: Annotation) => {
    if (!imageMetrics) return false;
    const scaledCoords = {
      x: annotation.coordinates.x * imageMetrics.scale + imageMetrics.x,
      y: annotation.coordinates.y * imageMetrics.scale + imageMetrics.y,
      width: annotation.coordinates.width * imageMetrics.scale,
      height: annotation.coordinates.height * imageMetrics.scale
    };

    return (
      x >= scaledCoords.x &&
      x <= scaledCoords.x + scaledCoords.width &&
      y >= scaledCoords.y &&
      y <= scaledCoords.y + scaledCoords.height
    );
  };

  useEffect(() => {
    if (draggedAnnotation && mousePos && dragStartPos && imageMetrics) {
      drawCanvas();
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const canvasX = mousePos.x - rect.left;
      const canvasY = mousePos.y - rect.top;

      ctx.save();
      ctx.globalAlpha = 0.6;

      const originalCoords = draggedAnnotation.coordinates;
      const scaledWidth = originalCoords.width * imageMetrics.scale;
      const scaledHeight = originalCoords.height * imageMetrics.scale;

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        canvasX - scaledWidth / 2,
        canvasY - scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );

      if (draggedAnnotation.tool?.name) {
        ctx.font = '14px Arial';
        const padding = 4;
        const textHeight = 16;
        const textMetrics = ctx.measureText(draggedAnnotation.tool.name);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
          canvasX - scaledWidth / 2,
          canvasY - scaledHeight / 2 - textHeight - padding * 2,
          textMetrics.width + padding * 2,
          textHeight + padding * 2
        );

        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          draggedAnnotation.tool.name,
          canvasX - scaledWidth / 2 + padding,
          canvasY - scaledHeight / 2 - padding
        );
      }

      ctx.restore();
    }
  }, [draggedAnnotation, mousePos, dragStartPos, imageMetrics]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggable || !imageMetrics) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedAnnotation = existingAnnotations.find(annotation => 
      isOverAnnotation(x, y, annotation)
    );

    if (clickedAnnotation) {
      onAnnotationDragStart?.(clickedAnnotation, { x: e.clientX, y: e.clientY });
      e.currentTarget.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggable || !imageMetrics) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const overAnnotation = existingAnnotations.some(annotation => 
      isOverAnnotation(x, y, annotation)
    );

    e.currentTarget.style.cursor = overAnnotation ? 'grab' : (isDropTarget ? 'copy' : 'default');
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedAnnotation && isDropTarget && mousePos && dragStartPos && imageMetrics) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newCoords = {
        x: (x - imageMetrics.x) / imageMetrics.scale,
        y: (y - imageMetrics.y) / imageMetrics.scale,
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
    
    const toDelete = selectedAnnotations.length > 0 ? selectedAnnotations : 
                    selectedAnnotation ? [selectedAnnotation] : [];
    
    toDelete.forEach(annotation => {
      onAnnotationDelete(annotation);
    });

    setSelectedAnnotation(null);
    setSelectedAnnotations([]);
  };

  return (
    <div className="relative h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        style={{ cursor: draggedAnnotation ? 'grabbing' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
