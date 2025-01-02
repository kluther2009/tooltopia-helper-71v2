import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tool } from "../tool/types/Tool";
import { ScrollArea } from "../ui/scroll-area";

interface ProjectToolsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectToolsDialog({ projectId, open, onOpenChange }: ProjectToolsDialogProps) {
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);

  // Fetch all tools and project tools
  const { data: tools, isLoading } = useQuery({
    queryKey: ["all-tools"],
    queryFn: async () => {
      const { data: toolsData, error } = await supabase
        .from("tools")
        .select("*")
        .order("name");

      if (error) throw error;
      return toolsData as Tool[];
    },
    enabled: open,
  });

  const { data: projectTools } = useQuery({
    queryKey: ["project-tools", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select("tool_id")
        .eq("project_id", projectId);

      if (error) throw error;
      return data.map(pt => pt.tool_id);
    },
    enabled: open,
    onSuccess: (projectToolIds) => {
      if (!tools) return;
      
      const assigned = tools.filter(tool => projectToolIds.includes(tool.id));
      const available = tools.filter(tool => !projectToolIds.includes(tool.id));
      
      setAvailableTools(available);
      setSelectedTools(assigned);
    }
  });

  const moveToSelected = async () => {
    if (selectedAvailable.length === 0) return;

    const toolsToMove = availableTools.filter(tool => selectedAvailable.includes(tool.id));
    
    // Insert new project tools
    const { error } = await supabase
      .from("project_tools")
      .insert(
        toolsToMove.map(tool => ({
          project_id: projectId,
          tool_id: tool.id
        }))
      );

    if (error) {
      console.error("Error moving tools:", error);
      return;
    }

    setSelectedTools([...selectedTools, ...toolsToMove]);
    setAvailableTools(availableTools.filter(tool => !selectedAvailable.includes(tool.id)));
    setSelectedAvailable([]);
  };

  const moveToAvailable = async () => {
    if (selectedAssigned.length === 0) return;

    // Delete project tools
    const { error } = await supabase
      .from("project_tools")
      .delete()
      .eq("project_id", projectId)
      .in("tool_id", selectedAssigned);

    if (error) {
      console.error("Error removing tools:", error);
      return;
    }

    const toolsToMove = selectedTools.filter(tool => selectedAssigned.includes(tool.id));
    setAvailableTools([...availableTools, ...toolsToMove]);
    setSelectedTools(selectedTools.filter(tool => !selectedAssigned.includes(tool.id)));
    setSelectedAssigned([]);
  };

  const handleAvailableSelect = (toolId: string) => {
    setSelectedAvailable(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleAssignedSelect = (toolId: string) => {
    setSelectedAssigned(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Project Tools</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="text-center py-4">Loading tools...</div>
        ) : (
          <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
            {/* Available Tools */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Available Tools</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {availableTools.map((tool) => (
                    <div
                      key={tool.id}
                      className={`p-2 rounded cursor-pointer ${
                        selectedAvailable.includes(tool.id)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => handleAvailableSelect(tool.id)}
                    >
                      {tool.name}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Arrow Buttons */}
            <div className="flex flex-col justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={moveToSelected}
                disabled={selectedAvailable.length === 0}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={moveToAvailable}
                disabled={selectedAssigned.length === 0}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Tools */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Project Tools</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {selectedTools.map((tool) => (
                    <div
                      key={tool.id}
                      className={`p-2 rounded cursor-pointer ${
                        selectedAssigned.includes(tool.id)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => handleAssignedSelect(tool.id)}
                    >
                      {tool.name}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}