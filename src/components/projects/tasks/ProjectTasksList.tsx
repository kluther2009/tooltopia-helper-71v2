import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock } from "lucide-react";

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
  const { data: tasks } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjectTask[];
    },
  });

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
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-slate-700 p-3 rounded-lg space-y-2"
        >
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <span className="font-medium text-slate-200">{task.title}</span>
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
  );
}