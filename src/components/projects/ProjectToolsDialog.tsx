import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tool } from "../tool/types/Tool";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { toast } from "sonner";

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
  });

  // Update available and selected tools when data changes
  useEffect(() => {
    if (tools && projectTools) {
      const assigned = tools.filter(tool => projectTools.includes(tool.id));
      const available = tools.filter(tool => !projectTools.includes(tool.id));
      setSelectedTools(assigned);
      setAvailableTools(available);
    }
  }, [tools, projectTools]);

  const handleClose = () => {
    onOpenChange(false);
    // Invalidate both projects and project-tools queries
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["project-tools-list", projectId] });
    queryClient.invalidateQueries({ queryKey: ["project-materials", projectId] });
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
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Available Tools</h3>
            <ScrollArea className="h-[300px]">
              {availableTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`p-2 cursor-pointer rounded ${
                    selectedAvailable.includes(tool.id)
                      ? "bg-slate-200"
                      : "hover:bg-slate-100"
                  }`}
                  onClick={() => {
                    if (selectedAvailable.includes(tool.id)) {
                      setSelectedAvailable(
                        selectedAvailable.filter((id) => id !== tool.id)
                      );
                    } else {
                      setSelectedAvailable([...selectedAvailable, tool.id]);
                    }
                  }}
                >
                  {tool.name}
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="flex flex-col justify-center gap-2">
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

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Selected Tools</h3>
            <ScrollArea className="h-[300px]">
              {selectedTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`p-2 cursor-pointer rounded ${
                    selectedAssigned.includes(tool.id)
                      ? "bg-slate-200"
                      : "hover:bg-slate-100"
                  }`}
                  onClick={() => {
                    if (selectedAssigned.includes(tool.id)) {
                      setSelectedAssigned(
                        selectedAssigned.filter((id) => id !== tool.id)
                      );
                    } else {
                      setSelectedAssigned([...selectedAssigned, tool.id]);
                    }
                  }}
                >
                  {tool.name}
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}