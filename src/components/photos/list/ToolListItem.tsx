
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Square, Pencil, Trash2, Database } from "lucide-react";

interface Tool {
  label: string;
  box_2d: number[];
}

interface ToolListItemProps {
  tool: Tool;
  isSelected: boolean;
  isEditing: boolean;
  onSelectTool: (tool: Tool) => void;
  onSaveTool: (tool: Tool) => void;
  onRenameTool?: (oldLabel: string, newLabel: string) => void;
  onDeleteTool?: (tool: Tool) => void;
  editingLabel: string | null;
  setEditingLabel: (label: string | null) => void;
}

export function ToolListItem({
  tool,
  isSelected,
  isEditing,
  onSelectTool,
  onSaveTool,
  onRenameTool,
  onDeleteTool,
  editingLabel,
  setEditingLabel
}: ToolListItemProps) {
  const [newLabel, setNewLabel] = useState<string>(tool.label);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLabel(tool.label);
    setNewLabel(tool.label);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabel.trim() && onRenameTool) {
      onRenameTool(tool.label, newLabel.trim());
      setEditingLabel(null);
      setNewLabel("");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteTool) {
      onDeleteTool(tool);
    }
  };

  const handleSaveToDBClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveTool(tool);
  };

  if (editingLabel === tool.label) {
    return (
      <div 
        className={`p-2 rounded flex justify-between items-center cursor-pointer transition-colors ${
          isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <form 
          onSubmit={handleRenameSubmit}
          className="flex-1 flex items-center gap-2"
        >
          <Input 
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2"
            type="submit"
          >
            <Check className="h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div 
      className={`p-2 rounded flex justify-between items-center cursor-pointer transition-colors ${
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      }`}
      onClick={() => onSelectTool(tool)}
    >
      <div className="flex items-center gap-2">
        <Square className="h-4 w-4" />
        <span className="text-sm">{tool.label}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 px-2 text-primary hover:text-primary"
          onClick={handleSaveToDBClick}
          title="Save tool to database"
        >
          <Database className="h-4 w-4" />
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 px-2"
          onClick={handleRenameClick}
          title="Rename tool"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 px-2 text-destructive hover:text-destructive"
          onClick={handleDeleteClick}
          title="Delete tool"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
