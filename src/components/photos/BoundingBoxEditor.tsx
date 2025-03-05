import { useState, useEffect, RefObject, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Save, XCircle, Move } from "lucide-react";
import { ToolBoundingBox } from "./ToolBoundingBox";

interface Tool {
  label: string;
  box_2d: number[];
}

interface BoundingBoxEditorProps {
  imageRef: RefObject<HTMLImageElement>;
  selectedTool: Tool;
  orientation: 'landscape' | 'portrait' | 'square';
  onSave: (tool: Tool) => void;
  onCancel: () => void;
  convertCoordinates: (box2d: number[]) => {
    xMin: number;
    yMin: number;
    width: number;
    height: number;
  };
}

export function BoundingBoxEditor({
  imageRef,
  selectedTool,
  orientation,
  onSave,
  onCancel,
  convertCoordinates
}: BoundingBoxEditorProps) {
  const [adjustedBox, setAdjustedBox] = useState<number[]>([...selectedTool.box_2d]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragDirection, setDragDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentCoords, setCurrentCoords] = useState(convertCoordinates(adjustedBox));
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setAdjustedBox([...selectedTool.box_2d]);
    setCurrentCoords(convertCoordinates(selectedTool.box_2d));
  }, [selectedTool, convertCoordinates]);
  
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleDrag = (e: React.MouseEvent, direction: string) => {
    if (!isDragging || !startPos) return;
    
    e.preventDefault();
    setDragDirection(direction);
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    let newCoords = { ...currentCoords };
    
    if (direction === 'move') {
      newCoords.xMin += deltaX;
      newCoords.yMin += deltaY;
    } else {
      if (direction.includes('top')) {
        newCoords.yMin += deltaY;
        newCoords.height -= deltaY;
      }
      if (direction.includes('bottom')) {
        newCoords.height += deltaY;
      }
      if (direction.includes('left')) {
        newCoords.xMin += deltaX;
        newCoords.width -= deltaX;
      }
      if (direction.includes('right')) {
        newCoords.width += deltaX;
      }
    }
    
    if (newCoords.width < 10) newCoords.width = 10;
    if (newCoords.height < 10) newCoords.height = 10;
    
    setCurrentCoords(newCoords);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    updateAdjustedBoxFromCoords(newCoords);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragDirection(null);
    setStartPos(null);
  };
  
  const updateAdjustedBoxFromCoords = (coords: { xMin: number, yMin: number, width: number, height: number }) => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const { naturalWidth, naturalHeight } = img;
    const rect = img.getBoundingClientRect();
    
    const normalizedCoords = {
      xMin: (coords.xMin / rect.width) * 1000,
      yMin: (coords.yMin / rect.height) * 1000,
      xMax: ((coords.xMin + coords.width) / rect.width) * 1000,
      yMax: ((coords.yMin + coords.height) / rect.height) * 1000
    };
    
    let newBox: number[];
    if (orientation === 'portrait') {
      newBox = [
        Math.max(0, Math.min(1000, normalizedCoords.xMin)),
        Math.max(0, Math.min(1000, normalizedCoords.yMin)),
        Math.max(0, Math.min(1000, normalizedCoords.xMax)),
        Math.max(0, Math.min(1000, normalizedCoords.yMax))
      ];
    } else {
      newBox = [
        Math.max(0, Math.min(1000, normalizedCoords.yMin)),
        Math.max(0, Math.min(1000, normalizedCoords.xMin)),
        Math.max(0, Math.min(1000, normalizedCoords.yMax)),
        Math.max(0, Math.min(1000, normalizedCoords.xMax))
      ];
    }
    
    setAdjustedBox(newBox);
  };
  
  const handleSave = () => {
    onSave({
      ...selectedTool,
      box_2d: adjustedBox
    });
  };
  
  return (
    <div ref={containerRef} className="absolute inset-0 z-10">
      <ToolBoundingBox
        label={selectedTool.label}
        coords={currentCoords}
        isHighlighted={true}
        isActive={true}
        isDraggable={true}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
      
      <div className="fixed bottom-4 left-1/4 right-1/4 mx-auto bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Editing: {selectedTool.label}</span>
          <div className="flex items-center text-xs text-muted-foreground">
            <Move className="h-4 w-4 mr-1" /> Drag box or corners to adjust
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            <XCircle className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Update
          </Button>
        </div>
      </div>
    </div>
  );
}
