
import { useState, useEffect, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Save, XCircle } from "lucide-react";

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
  
  // Reset adjusted box when selected tool changes
  useEffect(() => {
    setAdjustedBox([...selectedTool.box_2d]);
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
  
  return (
    <div className="absolute bottom-4 right-4 bg-background border rounded-lg shadow-lg p-3 space-y-3 z-10">
      <div className="text-sm font-medium flex justify-between items-center">
        <span>Adjust: {selectedTool.label}</span>
      </div>
      
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
