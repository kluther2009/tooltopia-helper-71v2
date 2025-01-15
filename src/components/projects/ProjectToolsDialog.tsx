import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { ToolSelectionList } from "./tools/ToolSelectionList";
import { ToolTransferControls } from "./tools/ToolTransferControls";

interface ProjectToolsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_TOOLS_PER_PROJECT = 20;

export function ProjectToolsDialog({ 
  projectId, 
  open, 
  onOpenChange 
}: ProjectToolsDialogProps) {
  const queryClient = useQueryClient();
  const [selectedAvailableTool, setSelectedAvailableTool] = useState<string | null>(null);
  const [selectedSelectedTool, setSelectedSelectedTool] = useState<string | null>(null);
  const [availableToolsSearch, setAvailableToolsSearch] = useState("");
  const [selectedToolsSearch, setSelectedToolsSearch] = useState("");

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

  // Filter tools based on search input
  const filteredAvailableTools = availableTools.filter(tool => 
    tool.name.toLowerCase().includes(availableToolsSearch.toLowerCase())
  );
  const filteredSelectedTools = selectedTools.filter(tool => 
    tool.name.toLowerCase().includes(selectedToolsSearch.toLowerCase())
  );

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
        // Check if adding another tool would exceed the limit
        if (selectedTools.length >= MAX_TOOLS_PER_PROJECT) {
          toast.error(`Cannot add more than ${MAX_TOOLS_PER_PROJECT} tools to a project`);
          return;
        }

        // If tool doesn't exist and under limit, add it
        const { error: insertError } = await supabase
          .from('project_tools')
          .insert({
            project_id: projectId,
            tool_id: toolId,
          });

        if (insertError) throw insertError;
        toast.success('Tool added to project');
      }
      
      // Reset selections after moving a tool
      setSelectedAvailableTool(null);
      setSelectedSelectedTool(null);
      
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Select Tools ({selectedTools.length}/{MAX_TOOLS_PER_PROJECT})</DialogTitle>
        </DialogHeader>
        <div className="flex items-stretch gap-4">
          <ToolSelectionList 
            tools={filteredAvailableTools}
            title="Available Tools"
            selectedTool={selectedAvailableTool}
            onToolSelect={setSelectedAvailableTool}
            searchValue={availableToolsSearch}
            onSearchChange={setAvailableToolsSearch}
          />
          
          <ToolTransferControls
            onMoveRight={() => selectedAvailableTool && handleToolSelect(selectedAvailableTool)}
            onMoveLeft={() => selectedSelectedTool && handleToolSelect(selectedSelectedTool)}
            canMoveRight={!!selectedAvailableTool && selectedTools.length < MAX_TOOLS_PER_PROJECT}
            canMoveLeft={!!selectedSelectedTool}
          />

          <ToolSelectionList 
            tools={filteredSelectedTools}
            title="Selected Tools"
            selectedTool={selectedSelectedTool}
            onToolSelect={setSelectedSelectedTool}
            searchValue={selectedToolsSearch}
            onSearchChange={setSelectedToolsSearch}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}