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
  const { data: tools } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tools").select("*");
      if (error) throw error;
      return data as Tool[];
    },
    staleTime: 0,
  });

  // Fetch project tools
  const { data: projectTools } = useQuery({
    queryKey: ["project-tools-list", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select("tool_id")
        .eq("project_id", projectId);
      if (error) throw error;
      return data.map((pt) => pt.tool_id);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Update available and selected tools when data changes or dialog opens
  useEffect(() => {
    if (tools && projectTools && open) {
      const assigned = tools.filter((tool) => projectTools.includes(tool.id));
      const available = tools.filter((tool) => !projectTools.includes(tool.id));
      setSelectedTools(assigned);
      setAvailableTools(available);
    }
  }, [tools, projectTools, open]);

  const handleClose = () => {
    onOpenChange(false);
    // Reset selections
    setSelectedAvailable([]);
    setSelectedAssigned([]);
    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["project-tools-list", projectId] });
  };

  const moveToSelected = async () => {
    try {
      const toolsToMove = availableTools.filter((tool) =>
        selectedAvailable.includes(tool.id)
      );

      for (const tool of toolsToMove) {
        await supabase.from("project_tools").insert({
          project_id: projectId,
          tool_id: tool.id,
        });
      }

      setSelectedTools([...selectedTools, ...toolsToMove]);
      setAvailableTools(
        availableTools.filter((tool) => !selectedAvailable.includes(tool.id))
      );
      setSelectedAvailable([]);
      toast.success("Tools added to project");
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ["project-tools-list", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error) {
      console.error("Error moving tools:", error);
      toast.error("Failed to add tools to project");
    }
  };

  const moveToAvailable = async () => {
    try {
      for (const toolId of selectedAssigned) {
        await supabase
          .from("project_tools")
          .delete()
          .eq("project_id", projectId)
          .eq("tool_id", toolId);
      }

      const toolsToMove = selectedTools.filter((tool) =>
        selectedAssigned.includes(tool.id)
      );
      setAvailableTools([...availableTools, ...toolsToMove]);
      setSelectedTools(
        selectedTools.filter((tool) => !selectedAssigned.includes(tool.id))
      );
      setSelectedAssigned([]);
      toast.success("Tools removed from project");
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ["project-tools-list", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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