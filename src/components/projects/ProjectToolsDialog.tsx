import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tool } from "@/hooks/useTools";
import { toast } from "sonner";
import { ToolSelectionList } from "./project-tools/ToolSelectionList";
import { TransferButtons } from "./project-tools/TransferButtons";

interface ProjectToolsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectToolsDialog({
  projectId,
  open,
  onOpenChange,
}: ProjectToolsDialogProps) {
  const queryClient = useQueryClient();
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);

  // Fetch all tools
  const { data: allTools, isLoading: isLoadingTools } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tools").select("*");
      if (error) throw error;
      return data as Tool[];
    },
    staleTime: 0,
  });

  // Fetch project tools
  const { data: projectToolIds, isLoading: isLoadingProjectTools } = useQuery({
    queryKey: ["project-tools", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select("tool_id")
        .eq('project_id', projectId);
      if (error) throw error;
      return data.map((pt) => pt.tool_id);
    },
    enabled: open,
  });

  useEffect(() => {
    if (!isLoadingTools && !isLoadingProjectTools && allTools && projectToolIds && open) {
      const assigned = allTools.filter((tool) => projectToolIds.includes(tool.id));
      const available = allTools.filter((tool) => !projectToolIds.includes(tool.id));
      setSelectedTools(assigned);
      setAvailableTools(available);
    }
  }, [allTools, projectToolIds, open, isLoadingTools, isLoadingProjectTools]);

  const handleClose = () => {
    setSelectedAvailable([]);
    setSelectedAssigned([]);
    onOpenChange(false);
  };

  const moveToSelected = async () => {
    try {
      const toolsToMove = availableTools.filter((tool) =>
        selectedAvailable.includes(tool.id)
      );

      const insertPromises = toolsToMove.map(tool => 
        supabase.from("project_tools").insert({
          project_id: projectId,
          tool_id: tool.id,
        })
      );

      const results = await Promise.all(insertPromises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to add some tools: ${errors.map(e => e.error?.message).join(', ')}`);
      }

      // Update local state first
      setSelectedTools(prev => [...prev, ...toolsToMove]);
      setAvailableTools(prev => 
        prev.filter((tool) => !selectedAvailable.includes(tool.id))
      );
      setSelectedAvailable([]);
      
      // Then invalidate the query
      await queryClient.invalidateQueries({ 
        queryKey: ["project-tools", projectId]
      });
      
      toast.success("Tools added to project");
    } catch (error) {
      console.error("Error moving tools:", error);
      toast.error("Failed to add tools to project");
    }
  };

  const moveToAvailable = async () => {
    try {
      const { error } = await supabase
        .from("project_tools")
        .delete()
        .eq("project_id", projectId)
        .in("tool_id", selectedAssigned);

      if (error) throw error;

      const toolsToMove = selectedTools.filter((tool) =>
        selectedAssigned.includes(tool.id)
      );
      
      // Update local state first
      setAvailableTools(prev => [...prev, ...toolsToMove]);
      setSelectedTools(prev =>
        prev.filter((tool) => !selectedAssigned.includes(tool.id))
      );
      setSelectedAssigned([]);
      
      // Then invalidate the query
      await queryClient.invalidateQueries({ 
        queryKey: ["project-tools", projectId]
      });
      
      toast.success("Tools removed from project");
    } catch (error) {
      console.error("Error removing tools:", error);
      toast.error("Failed to remove tools from project");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Project Tools</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
          <ToolSelectionList
            title="Available Tools"
            tools={availableTools}
            selectedTools={selectedAvailable}
            onToolSelect={(toolId) => {
              if (selectedAvailable.includes(toolId)) {
                setSelectedAvailable(
                  selectedAvailable.filter((id) => id !== toolId)
                );
              } else {
                setSelectedAvailable([...selectedAvailable, toolId]);
              }
            }}
          />

          <TransferButtons
            onMoveToSelected={moveToSelected}
            onMoveToAvailable={moveToAvailable}
            disableRight={selectedAvailable.length === 0}
            disableLeft={selectedAssigned.length === 0}
          />

          <ToolSelectionList
            title="Selected Tools"
            tools={selectedTools}
            selectedTools={selectedAssigned}
            onToolSelect={(toolId) => {
              if (selectedAssigned.includes(toolId)) {
                setSelectedAssigned(
                  selectedAssigned.filter((id) => id !== toolId)
                );
              } else {
                setSelectedAssigned([...selectedAssigned, toolId]);
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}