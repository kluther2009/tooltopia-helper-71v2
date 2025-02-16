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
  const [imageMetrics, setImageMetrics] = useState<{
    scale: number;
    x: number;
    y: number;
    scaledWidth: number;
    scaledHeight: number;
  } | null>(null);
  const [draggedAnnotation, setDraggedAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [resizing, setResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Annotation[]>([]);
  
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

  const handleAnnotationDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggable || !imageMetrics) return;

    const coords = getMouseCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    if (selectedAnnotation) {
      for (const handle of ['se', 'sw', 'ne', 'nw'] as const) {
        if (isResizeHandle(selectedAnnotation, coords.x, coords.y, handle)) {
          setResizing(true);
          setResizeHandle(handle);
          e.preventDefault();
          return;
        }
      }
    }

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
      e.preventDefault();
    } else {
      if (!e.shiftKey) {
        setSelectedAnnotation(null);
        setSelectedAnnotations([]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    if (!isDropTarget || !imageMetrics || !onAnnotationDragEnd) return;
    
    e.preventDefault();
    const coords = getMouseCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    if (selectedAnnotations.length > 0 && draggedAnnotation) {
      const draggedIdx = selectedAnnotations.findIndex(a => a.id === draggedAnnotation.id);
      if (draggedIdx !== -1) {
        const offsetX = coords.x - (draggedAnnotation.coordinates.x * imageMetrics.scale + imageMetrics.x);
        const offsetY = coords.y - (draggedAnnotation.coordinates.y * imageMetrics.scale + imageMetrics.y);

        selectedAnnotations.forEach(annotation => {
          const newCoords = {
            x: ((annotation.coordinates.x * imageMetrics.scale + imageMetrics.x + offsetX) - imageMetrics.x) / imageMetrics.scale,
            y: ((annotation.coordinates.y * imageMetrics.scale + imageMetrics.y + offsetY) - imageMetrics.y) / imageMetrics.scale,
            width: annotation.coordinates.width,
            height: annotation.coordinates.height
          };
          onAnnotationDragEnd(annotation, newCoords);
        });
      }
    } else if (draggedAnnotation) {
      const newCoordinates = {
        x: (coords.x - imageMetrics.x) / imageMetrics.scale,
        y: (coords.y - imageMetrics.y) / imageMetrics.scale,
        width: draggedAnnotation.coordinates.width,
        height: draggedAnnotation.coordinates.height
      };
      onAnnotationDragEnd(draggedAnnotation, newCoordinates);
    }

    setDraggedAnnotation(null);
    setSelectedAnnotation(null);
    setSelectedAnnotations([]);
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

  const getCursorStyle = () => {
    if (isDraggable) {
      return draggedAnnotation ? 'grabbing' : 'grab';
    }
    if (isDropTarget) {
      return 'copy';
    }
    return isReadOnly ? 'default' : 'crosshair';
  };

  return (
    <div className="relative h-full">
      <canvas
        ref={canvasRef}
        className={`w-full h-full touch-none`}
        style={{ cursor: getCursorStyle() }}
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
