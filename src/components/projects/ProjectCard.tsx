import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Wrench, Calendar, DollarSign } from "lucide-react";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { ProjectToolsDialog } from "./ProjectToolsDialog";
import { ProjectMaterialsDialog } from "./ProjectMaterialsDialog";
import { useState } from "react";
import { Project } from "@/types/projects";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectTool {
  tool_id: string;
  tools: {
    name: string;
  } | null;
}

export function ProjectCard({ project }: { project: Project }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [isMaterialsDialogOpen, setIsMaterialsDialogOpen] = useState(false);

  // Fetch materials for this project
  const { data: materials } = useQuery({
    queryKey: ["project-materials", project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_materials")
        .select("*")
        .eq("project_id", project.id);
      if (error) throw error;
      return data;
    },
  });

  // Fetch tools for this project
  const { data: tools } = useQuery<ProjectTool[]>({
    queryKey: ["project-tools", project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select("tool_id, tools(name)")
        .eq("project_id", project.id);
      if (error) throw error;
      console.log("Tools data:", data); // Debug log
      return data || []; // Ensure we always return an array
    },
  });

  const statusColors = {
    planned: "bg-blue-600 text-white",
    ongoing: "bg-orange-600 text-white",
    completed: "bg-green-600 text-white",
  };

  return (
    <Card className="p-4 bg-slate-800 text-white">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <Badge className={statusColors[project.status]} variant="secondary">
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              {project.target_date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(project.target_date), "MMM d, yyyy")}
                </div>
              )}
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {typeof project.total_cost === 'number' 
                  ? `$${project.total_cost.toFixed(2)}`
                  : '$0.00'
                }
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => setIsMaterialsDialogOpen(true)}
            >
              <DollarSign className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => setIsToolsDialogOpen(true)}
            >
              <Wrench className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Materials Needed:</h4>
            <div className="flex flex-wrap gap-2">
              {materials?.map((material) => (
                <Badge
                  key={material.id}
                  variant="secondary"
                  className="bg-slate-700 text-slate-200"
                >
                  {material.name} x{material.quantity}
                </Badge>
              ))}
              {!materials?.length && (
                <span className="text-sm text-slate-400">No materials added</span>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Tools Required:</h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(tools) && tools.map((tool) => (
                <Badge
                  key={tool.tool_id}
                  variant="secondary"
                  className="bg-slate-700 text-slate-200"
                >
                  {tool.tools?.name}
                </Badge>
              ))}
              {!tools?.length && (
                <span className="text-sm text-slate-400">No tools added</span>
              )}
            </div>
          </div>
        </div>

        {project.notes && (
          <div className="text-sm text-slate-300">
            <span className="font-medium">Note:</span> {project.notes}
          </div>
        )}
      </div>

      <EditProjectDialog
        project={project}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <DeleteProjectDialog
        project={project}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
      <ProjectToolsDialog
        projectId={project.id}
        open={isToolsDialogOpen}
        onOpenChange={setIsToolsDialogOpen}
      />
      <ProjectMaterialsDialog
        project={project}
        open={isMaterialsDialogOpen}
        onOpenChange={setIsMaterialsDialogOpen}
      />
    </Card>
  );
}