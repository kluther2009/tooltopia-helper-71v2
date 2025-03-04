
import { Button } from "@/components/ui/button";
import { Check, Square, Edit, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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
  const [newLabel, setNewLabel] = useState<string>("");

  const handleRenameClick = (e: React.MouseEvent, tool: Tool) => {
    e.stopPropagation();
    setEditingLabel(tool.label);
    setNewLabel(tool.label);
  };

  const handleRenameSubmit = (e: React.FormEvent, originalLabel: string) => {
    e.preventDefault();
    if (newLabel.trim() && onRenameTool) {
      onRenameTool(originalLabel, newLabel.trim());
      setEditingLabel(null);
      setNewLabel("");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, tool: Tool) => {
    e.stopPropagation();
    if (onDeleteTool) {
      onDeleteTool(tool);
    }
  };

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
              onClick={() => editingLabel !== tool.label && onSelectTool(tool)}
            >
              {editingLabel === tool.label ? (
                <form 
                  onSubmit={(e) => handleRenameSubmit(e, tool.label)}
                  className="flex-1 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
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
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    <span className="text-sm">{tool.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
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
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-2"
                      onClick={(e) => handleRenameClick(e, tool)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-2 text-destructive hover:text-destructive"
                      onClick={(e) => handleDeleteClick(e, tool)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
