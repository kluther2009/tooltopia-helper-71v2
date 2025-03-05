
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
  
  // Reset adjusted box when selected tool changes
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
    
    // Update the bounding box based on drag direction
    let newCoords = { ...currentCoords };
    
    if (direction === 'move') {
      // Move the entire box
      newCoords.xMin += deltaX;
      newCoords.yMin += deltaY;
    } else {
      // Resize based on which corner/edge is being dragged
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
    
    // Ensure box has positive dimensions
    if (newCoords.width < 10) newCoords.width = 10;
    if (newCoords.height < 10) newCoords.height = 10;
    
    setCurrentCoords(newCoords);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    // Convert coordinates back to normalized format for saving
    updateAdjustedBoxFromCoords(newCoords);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragDirection(null);
    setStartPos(null);
  };
  
  // Convert display coordinates back to normalized box_2d format
  const updateAdjustedBoxFromCoords = (coords: { xMin: number, yMin: number, width: number, height: number }) => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const { naturalWidth, naturalHeight } = img;
    const rect = img.getBoundingClientRect();
    
    // Convert from screen coordinates to normalized coordinates (0-1000)
    const normalizedCoords = {
      xMin: (coords.xMin / rect.width) * 1000,
      yMin: (coords.yMin / rect.height) * 1000,
      xMax: ((coords.xMin + coords.width) / rect.width) * 1000,
      yMax: ((coords.yMin + coords.height) / rect.height) * 1000
    };
    
    // Format based on orientation
    let newBox: number[];
    if (orientation === 'portrait') {
      // For portrait: [x_min, y_min, x_max, y_max]
      newBox = [
        Math.max(0, Math.min(1000, normalizedCoords.xMin)),
        Math.max(0, Math.min(1000, normalizedCoords.yMin)),
        Math.max(0, Math.min(1000, normalizedCoords.xMax)),
        Math.max(0, Math.min(1000, normalizedCoords.yMax))
      ];
    } else {
      // For landscape/square: [y_min, x_min, y_max, x_max]
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
  
  // Determine the optimal position for the control panel
  // Position at top if bounding box is in lower half, otherwise at bottom
  const controlPosition = currentCoords.yMin > (imageRef.current?.clientHeight || 0) / 2 ? 'top' : 'bottom';
  
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
      
      <div className={`absolute ${controlPosition === 'top' ? 'top-4' : 'bottom-4'} left-4 bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg p-3 space-y-2 z-20 max-w-[200px]`}>
        <div className="text-sm font-medium">
          <span>Editing: {selectedTool.label}</span>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <Move className="h-4 w-4 mr-1" /> Drag box or corners to adjust
        </div>
        
        <div className="flex justify-between gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
            <XCircle className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-1" /> Update
          </Button>
        </div>
      </div>
    </div>
  );
}
