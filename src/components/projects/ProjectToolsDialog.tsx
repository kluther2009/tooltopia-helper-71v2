import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ProjectToolsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectToolsDialog({ projectId, open, onOpenChange }: ProjectToolsDialogProps) {
  const queryClient = useQueryClient();

  // Fetch all tools
  const { data: tools = [] } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000,
  });

  // Fetch selected tools for this project using the same configuration as ProjectTools
  const { data: selectedTools = [] } = useQuery({
    queryKey: ["project-tools", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select("tool_id")
        .eq("project_id", projectId);
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000,
  });

  const isToolSelected = (toolId: string) => {
    return selectedTools.some(pt => pt.tool_id === toolId);
  };

  const handleToolSelect = async (toolId: string) => {
    try {
      const { data: existingTool, error: checkError } = await supabase
        .from('project_tools')
        .select('id')
        .eq('project_id', projectId)
        .eq('tool_id', toolId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingTool) {
        // If tool exists, remove it
        const { error: deleteError } = await supabase
          .from('project_tools')
          .delete()
          .eq('project_id', projectId)
          .eq('tool_id', toolId);

        if (deleteError) throw deleteError;
        toast.success('Tool removed from project');
      } else {
        // If tool doesn't exist, add it
        const { error: insertError } = await supabase
          .from('project_tools')
          .insert({
            project_id: projectId,
            tool_id: toolId,
          });

        if (insertError) throw insertError;
        toast.success('Tool added to project');
      }
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["project-tools", projectId] });
    } catch (error) {
      console.error('Error managing project tool:', error);
      toast.error('Failed to update project tools');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Tools</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {tools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className="flex items-center justify-between p-3 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <span className="text-sm font-medium">{tool.name}</span>
                <Check 
                  className={`h-4 w-4 ${isToolSelected(tool.id) ? 'text-green-500' : 'text-transparent'}`}
                />
              </div>
            ))}
            {tools.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No tools available
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}