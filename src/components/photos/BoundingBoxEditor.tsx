
import { useState, useEffect, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Save, XCircle, Move } from "lucide-react";

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
}

export function BoundingBoxEditor({
  imageRef,
  selectedTool,
  orientation,
  onSave,
  onCancel
}: BoundingBoxEditorProps) {
  const [adjustedBox, setAdjustedBox] = useState<number[]>([...selectedTool.box_2d]);
  const [mode, setMode] = useState<'resize' | 'move'>('resize');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  
  // Reset adjusted box when selected tool changes
  useEffect(() => {
    setAdjustedBox([...selectedTool.box_2d]);
    setMode('resize');
    setIsDragging(false);
  }, [selectedTool]);
  
  const adjustBoundingBox = (direction: 'up' | 'down' | 'left' | 'right', value: number) => {
    const step = 5; // Adjustment step in normalized units (will be divided by 1000)
    
    if (orientation === 'portrait') {
      // For portrait: [x_min, y_min, x_max, y_max]
      const [xMin, yMin, xMax, yMax] = adjustedBox;
      
      switch (direction) {
        case 'up':
          setAdjustedBox([xMin, Math.max(0, yMin - step), xMax, yMax]);
          break;
        case 'down':
          setAdjustedBox([xMin, yMin, xMax, Math.min(1000, yMax + step)]);
          break;
        case 'left':
          setAdjustedBox([Math.max(0, xMin - step), yMin, xMax, yMax]);
          break;
        case 'right':
          setAdjustedBox([xMin, yMin, Math.min(1000, xMax + step), yMax]);
          break;
      }
    } else {
      // For landscape/square: [y_min, x_min, y_max, x_max]
      const [yMin, xMin, yMax, xMax] = adjustedBox;
      
      switch (direction) {
        case 'up':
          setAdjustedBox([Math.max(0, yMin - step), xMin, yMax, xMax]);
          break;
        case 'down':
          setAdjustedBox([yMin, xMin, Math.min(1000, yMax + step), xMax]);
          break;
        case 'left':
          setAdjustedBox([yMin, Math.max(0, xMin - step), yMax, xMax]);
          break;
        case 'right':
          setAdjustedBox([yMin, xMin, yMax, Math.min(1000, xMax + step)]);
          break;
      }
    }
  };
  
  const handleSave = () => {
    onSave({
      ...selectedTool,
      box_2d: adjustedBox
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'move') return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // Add event listeners to handle mouse movements outside the component
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Convert pixel movement to normalized coordinates (approximately)
    const imgElement = imageRef.current;
    if (!imgElement) return;
    
    const stepX = (dx / imgElement.clientWidth) * 1000 * 0.05;
    const stepY = (dy / imgElement.clientHeight) * 1000 * 0.05;
    
    // Update the box coordinates based on movement
    if (orientation === 'portrait') {
      // For portrait: [x_min, y_min, x_max, y_max]
      const [xMin, yMin, xMax, yMax] = adjustedBox;
      
      setAdjustedBox([
        Math.max(0, Math.min(999 - (xMax - xMin), xMin + stepX)),
        Math.max(0, Math.min(999 - (yMax - yMin), yMin + stepY)),
        Math.max(xMin + 1, Math.min(1000, xMax + stepX)),
        Math.max(yMin + 1, Math.min(1000, yMax + stepY))
      ]);
    } else {
      // For landscape/square: [y_min, x_min, y_max, x_max]
      const [yMin, xMin, yMax, xMax] = adjustedBox;
      
      setAdjustedBox([
        Math.max(0, Math.min(999 - (yMax - yMin), yMin + stepY)),
        Math.max(0, Math.min(999 - (xMax - xMin), xMin + stepX)),
        Math.max(yMin + 1, Math.min(1000, yMax + stepY)),
        Math.max(xMin + 1, Math.min(1000, xMax + stepX))
      ]);
    }
    
    // Update drag start position for the next move
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Clean up event listeners when unmounting
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  return (
    <div 
      className="absolute bottom-4 right-4 bg-background border rounded-lg shadow-lg p-3 space-y-3 z-10"
      onMouseDown={handleMouseDown}
      style={{ cursor: mode === 'move' ? 'grab' : 'default' }}
    >
      <div className="text-sm font-medium flex justify-between items-center">
        <span>Adjust: {selectedTool.label}</span>
        
        <div className="flex items-center">
          <Button 
            size="sm" 
            variant={mode === 'resize' ? "default" : "outline"} 
            className="h-8 w-8 p-0"
            onClick={() => setMode('resize')}
            title="Resize Mode"
          >
            <div className="h-4 w-4 border border-current flex items-center justify-center">
              <div className="h-2 w-2 bg-current"></div>
            </div>
          </Button>
          
          <Button 
            size="sm" 
            variant={mode === 'move' ? "default" : "outline"} 
            className="h-8 w-8 p-0 ml-1"
            onClick={() => setMode('move')}
            title="Move Mode"
          >
            <Move className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {mode === 'resize' ? (
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => adjustBoundingBox('up', -1)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div></div>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => adjustBoundingBox('left', -1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div></div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => adjustBoundingBox('right', 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div></div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => adjustBoundingBox('down', 1)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div></div>
        </div>
      ) : (
        <div className="text-center py-2 text-sm text-muted-foreground border border-dashed border-gray-200 rounded">
          {isDragging ? "Moving..." : "Click and drag to move the box"}
        </div>
      )}
      
      <div className="flex justify-between gap-2 pt-1">
        <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
          <XCircle className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button size="sm" onClick={handleSave} className="flex-1">
          <Save className="h-4 w-4 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
}
