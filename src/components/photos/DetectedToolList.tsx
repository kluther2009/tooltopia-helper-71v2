
import { Button } from "@/components/ui/button";
import { Check, Square, Edit, Trash2, Save, X } from "lucide-react";
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
  onDeleteTool: (tool: Tool) => void;
  onRenameTool: (oldLabel: string, newLabel: string) => void;
  isEditing: boolean;
}

export function DetectedToolList({
  tools,
  selectedTool,
  onSelectTool,
  onSaveTool,
  onDeleteTool,
  onRenameTool,
  isEditing
}: DetectedToolListProps) {
  const [editingToolLabel, setEditingToolLabel] = useState<string | null>(null);
  const [newToolName, setNewToolName] = useState("");
  
  const handleStartRename = (tool: Tool, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingToolLabel(tool.label);
    setNewToolName(tool.label);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingToolLabel(null);
  };

  const handleSaveRename = (oldLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (newToolName.trim() !== "") {
      onRenameTool(oldLabel, newToolName.trim());
      setEditingToolLabel(null);
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
              className={`p-2 rounded flex justify-between items-center ${
                editingToolLabel === tool.label ? "" : "cursor-pointer"
              } transition-colors ${
                selectedTool?.label === tool.label 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              onClick={() => editingToolLabel !== tool.label && onSelectTool(tool)}
            >
              <div className="flex items-center gap-2 flex-1">
                <Square className="h-4 w-4 shrink-0" />
                
                {editingToolLabel === tool.label ? (
                  <Input
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm truncate">{tool.label}</span>
                )}
              </div>
              
              <div className="flex items-center">
                {editingToolLabel === tool.label ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0"
                      onClick={(e) => handleSaveRename(tool.label, e)}
                      title="Save rename"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0"
                      onClick={handleCancelRename}
                      title="Cancel rename"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    {selectedTool?.label === tool.label && !isEditing && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveTool(tool);
                        }}
                        title="Save tool to inventory"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0"
                      onClick={(e) => handleStartRename(tool, e)}
                      title="Rename tool"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTool(tool);
                      }}
                      title="Delete tool"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
