import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProjectToolsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectToolsDialog({ projectId, open, onOpenChange }: ProjectToolsDialogProps) {
  const queryClient = useQueryClient();

  // Fetch all tools
  const { data: allTools = [] } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch selected tools for this project
  const { data: projectTools = [] } = useQuery({
    queryKey: ["project-tools", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select(`
          id,
          tool_id,
          tool:tools (
            id,
            name
          )
        `)
        .eq("project_id", projectId);
      
      if (error) throw error;
      return data;
    },
    enabled: open && !!projectId,
    staleTime: 0,
  });

  // Get array of selected tool IDs
  const selectedToolIds = projectTools.map(pt => pt.tool_id);

  // Filter tools into available and selected lists
  const selectedTools = allTools.filter(tool => selectedToolIds.includes(tool.id));
  const availableTools = allTools.filter(tool => !selectedToolIds.includes(tool.id));

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
      
      // Invalidate both the dialog's tools query and the project card's tools query
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project-tools", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["project-tools-list", projectId] })
      ]);
    } catch (error) {
      console.error('Error managing project tool:', error);
      toast.error('Failed to update project tools');
    }
  };

  const ToolList = ({ tools, title }: { tools: any[], title: string }) => (
    <Card className="flex-1 p-4">
      <h3 className="font-medium mb-3 text-sm text-gray-700">{title}</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center justify-between p-3 hover:bg-slate-100 rounded-lg text-sm"
            >
              {tool.name}
            </div>
          ))}
          {tools.length === 0 && (
            <div className="text-center text-gray-500 py-4 text-sm">
              No tools available
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Select Tools</DialogTitle>
        </DialogHeader>
        <div className="flex items-stretch gap-4">
          <ToolList tools={availableTools} title="Available Tools" />
          
          <div className="flex flex-col justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const selectedTool = availableTools[0];
                if (selectedTool) {
                  handleToolSelect(selectedTool.id);
                }
              }}
              disabled={availableTools.length === 0}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const selectedTool = selectedTools[0];
                if (selectedTool) {
                  handleToolSelect(selectedTool.id);
                }
              }}
              disabled={selectedTools.length === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          <ToolList tools={selectedTools} title="Selected Tools" />
        </div>
      </DialogContent>
    </Dialog>
  );
}