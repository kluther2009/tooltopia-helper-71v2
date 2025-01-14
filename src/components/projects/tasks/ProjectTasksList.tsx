import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UpdateTaskDialog } from "./UpdateTaskDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  materials_used: string[];
  tools_used: string[];
}

export function ProjectTasksList({ projectId }: { projectId: string }) {
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("due_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as ProjectTask[];
    },
  });

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to delete task");
      return;
    }

    toast.success("Task deleted successfully");
    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-slate-500" />;
    }
  };

  if (!tasks?.length) {
    return (
      <div className="text-sm text-slate-400">
        No tasks added yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-700 p-3 rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className="font-medium text-slate-200">{task.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTaskToEdit(task)}
                        className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Task</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-slate-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Task</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-slate-300">{task.description}</p>
            )}
            
            {task.due_date && (
              <div className="text-sm text-slate-400">
                Due: {format(new Date(task.due_date), "MMM d, yyyy")}
              </div>
            )}

            {(task.materials_used?.length > 0 || task.tools_used?.length > 0) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {task.materials_used?.map((material, index) => (
                  <Badge
                    key={`${material}-${index}`}
                    variant="secondary"
                    className="bg-slate-600"
                  >
                    {material}
                  </Badge>
                ))}
                {task.tools_used?.map((tool, index) => (
                  <Badge
                    key={`${tool}-${index}`}
                    variant="secondary"
                    className="bg-slate-600"
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <UpdateTaskDialog
        task={taskToEdit}
        open={!!taskToEdit}
        onOpenChange={(open) => !open && setTaskToEdit(null)}
        projectId={projectId}
      />
    </>
  );
}