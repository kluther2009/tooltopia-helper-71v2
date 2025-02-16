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
}

export function AnnotationCanvas({ 
  imageUrl, 
  onRectangleDrawn, 
  existingAnnotations = [],
  isDraggable = false,
  isDropTarget = false,
  onAnnotationDragEnd,
  onAnnotationDelete
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const [imageMetrics, setImageMetrics] = useState<{
    scale: number;
    x: number;
    y: number;
    scaledWidth: number;
    scaledHeight: number;
  } | null>(null);
  const [draggedAnnotation, setDraggedAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Annotation[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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

  const drawDraggingAnnotations = () => {
    if (!canvasRef.current || !mousePos || !dragStartPosRef.current || !imageMetrics) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    drawCanvas();

    const offsetX = mousePos.x - dragStartPosRef.current.x;
    const offsetY = mousePos.y - dragStartPosRef.current.y;

    ctx.save();
    ctx.globalAlpha = 0.6;

    const annotations = selectedAnnotations.length > 0 ? selectedAnnotations : 
                       draggedAnnotation ? [draggedAnnotation] : [];

    annotations.forEach(annotation => {
      const originalCoords = {
        x: annotation.coordinates.x * imageMetrics.scale + imageMetrics.x,
        y: annotation.coordinates.y * imageMetrics.scale + imageMetrics.y,
        width: annotation.coordinates.width * imageMetrics.scale,
        height: annotation.coordinates.height * imageMetrics.scale
      };

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        originalCoords.x + offsetX,
        originalCoords.y + offsetY,
        originalCoords.width,
        originalCoords.height
      );

      if (annotation.tool?.name) {
        ctx.font = '14px Arial';
        const padding = 4;
        const textHeight = 16;
        const textMetrics = ctx.measureText(annotation.tool.name);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
          originalCoords.x + offsetX,
          originalCoords.y + offsetY - textHeight - padding * 2,
          textMetrics.width + padding * 2,
          textHeight + padding * 2
        );

        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          annotation.tool.name,
          originalCoords.x + offsetX + padding,
          originalCoords.y + offsetY - padding
        );
      }
    });

    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggable || !imageMetrics) return;

    const coords = getMouseCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    setMousePos(coords);

    if (isDragging) {
      drawDraggingAnnotations();
      return;
    }

    const overAnnotation = existingAnnotations.some(annotation => 
      isOverAnnotation(coords.x, coords.y, annotation)
    );

    e.currentTarget.style.cursor = overAnnotation ? 'grab' : (isDropTarget ? 'copy' : 'default');
  };

  const handleAnnotationDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggable || !imageMetrics) return;

    const coords = getMouseCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    dragStartPosRef.current = coords;
    setMousePos(coords);

    const clickedAnnotation = existingAnnotations.find(annotation => 
      isOverAnnotation(coords.x, coords.y, annotation)
    );

    if (clickedAnnotation) {
      if (e.shiftKey) {
        setSelectedAnnotations(prev => 
          prev.includes(clickedAnnotation) 
            ? prev.filter(a => a !== clickedAnnotation)
            : [...prev, clickedAnnotation]
        );
      } else {
        setSelectedAnnotation(clickedAnnotation);
        setDraggedAnnotation(clickedAnnotation);
        if (selectedAnnotations.length <= 1) {
          setSelectedAnnotations([clickedAnnotation]);
        }
      }
      setIsDragging(true);
      e.preventDefault();
      e.currentTarget.style.cursor = 'grabbing';
    } else {
      if (!e.shiftKey) {
        setSelectedAnnotation(null);
        setSelectedAnnotations([]);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && isDropTarget && mousePos && dragStartPosRef.current && imageMetrics) {
      const offsetX = mousePos.x - dragStartPosRef.current.x;
      const offsetY = mousePos.y - dragStartPosRef.current.y;

      const annotations = selectedAnnotations.length > 0 ? selectedAnnotations : 
                         draggedAnnotation ? [draggedAnnotation] : [];

      annotations.forEach(annotation => {
        const newCoords = {
          x: annotation.coordinates.x + (offsetX / imageMetrics.scale),
          y: annotation.coordinates.y + (offsetY / imageMetrics.scale),
          width: annotation.coordinates.width,
          height: annotation.coordinates.height
        };
        onAnnotationDragEnd?.(annotation, newCoords);
      });
    }

    setIsDragging(false);
    setDraggedAnnotation(null);
    dragStartPosRef.current = null;
    drawCanvas();
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
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
        onMouseDown={isDraggable ? handleAnnotationDrag : handleStart}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setDraggedAnnotation(null);
          dragStartPosRef.current = null;
          drawCanvas();
        }}
        onDragOver={(e) => {
          if (isDropTarget) {
            e.preventDefault();
          }
        }}
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
            disabled={!selectedAnnotation && selectedAnnotations.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}
    </div>
  );
}
