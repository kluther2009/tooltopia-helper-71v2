
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ToolListItem } from "./ToolListItem";

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
  onRenameTool?: (oldLabel: string, newLabel: string) => void;
  onDeleteTool?: (tool: Tool) => void;
}

export function DetectedToolList({
  tools,
  selectedTool,
  onSelectTool,
  onSaveTool,
  isEditing,
  onRenameTool,
  onDeleteTool
}: DetectedToolListProps) {
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-2">
        <h3 className="font-medium text-sm">Detected Tools</h3>
      </div>
      
      <Separator />
      
      <div className="flex-1 overflow-y-auto p-2">
        {tools.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">No tools detected</p>
        ) : (
          <div className="space-y-2">
            {tools.map((tool, index) => (
              <ToolListItem
                key={index}
                tool={tool}
                isSelected={selectedTool?.label === tool.label}
                isEditing={isEditing}
                onSelectTool={onSelectTool}
                onSaveTool={onSaveTool}
                onRenameTool={onRenameTool}
                onDeleteTool={onDeleteTool}
                editingLabel={editingLabel}
                setEditingLabel={setEditingLabel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
