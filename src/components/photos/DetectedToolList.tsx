
import { Button } from "@/components/ui/button";
import { Check, Square, Edit } from "lucide-react";
import { useState } from "react";

interface Tool {
  label: string;
  box_2d: number[];
}

interface DetectedToolListProps {
  tools: Tool[];
  selectedTool: Tool | null;
  onSelectTool: (tool: Tool) => void;
  onSaveTool: (tool: Tool) => void;
  isEditing: boolean;
}

export function DetectedToolList({
  tools,
  selectedTool,
  onSelectTool,
  onSaveTool,
  isEditing
}: DetectedToolListProps) {
  return (
    <div className="h-full flex flex-col gap-2 p-2 border-r border-gray-200 overflow-y-auto">
      <h3 className="font-medium text-sm mb-2">Detected Tools</h3>
      
      {tools.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tools detected</p>
      ) : (
        <div className="space-y-2">
          {tools.map((tool, index) => (
            <div 
              key={index}
              className={`p-2 rounded flex justify-between items-center cursor-pointer transition-colors ${
                selectedTool?.label === tool.label 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              onClick={() => onSelectTool(tool)}
            >
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                <span className="text-sm">{tool.label}</span>
              </div>
              
              {selectedTool?.label === tool.label && !isEditing && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveTool(tool);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
