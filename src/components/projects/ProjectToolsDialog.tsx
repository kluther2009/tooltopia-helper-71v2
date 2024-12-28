import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tool } from "@/hooks/useTools";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ProjectToolsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectToolsDialog({ projectId, open, onOpenChange }: ProjectToolsDialogProps) {
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available tools
  const { data: tools, isLoading: isLoadingTools } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*");
      
      if (error) throw error;
      return data as Tool[];
    },
  });

  // Fetch existing project tools
  const { data: projectTools, isLoading: isLoadingProjectTools } = useQuery({
    queryKey: ["project-tools", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select("tool_id")
        .eq("project_id", projectId);
      
      if (error) throw error;
      
      const toolIds = new Set(data.map(pt => pt.tool_id));
      setSelectedTools(toolIds);
      return toolIds;
    },
  });

  const handleToolToggle = (toolId: string) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(toolId)) {
      newSelected.delete(toolId);
    } else {
      newSelected.add(toolId);
    }
    setSelectedTools(newSelected);
  };

  const handleSave = async () => {
    if (!projectTools) return;

    setIsSubmitting(true);
    try {
      // Convert Sets to Arrays for comparison
      const currentToolIds = Array.from(projectTools);
      const newToolIds = Array.from(selectedTools);

      // Remove tools that were unselected
      const toolsToRemove = currentToolIds.filter(toolId => !selectedTools.has(toolId));
      if (toolsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("project_tools")
          .delete()
          .eq("project_id", projectId)
          .in("tool_id", toolsToRemove);
        
        if (deleteError) throw deleteError;
      }

      // Add newly selected tools
      const toolsToAdd = newToolIds.filter(toolId => !projectTools.has(toolId));
      if (toolsToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("project_tools")
          .insert(
            toolsToAdd.map(toolId => ({
              project_id: projectId,
              tool_id: toolId,
            }))
          );
        
        if (insertError) throw insertError;
      }

      toast.success("Project tools updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating project tools:", error);
      toast.error("Failed to update project tools");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingTools || isLoadingProjectTools;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Project Tools</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {tools?.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => handleToolToggle(tool.id)}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <span>{tool.name}</span>
                    {selectedTools.has(tool.id) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
                
                {!tools?.length && (
                  <div className="text-center text-gray-500 py-4">
                    No tools available
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}