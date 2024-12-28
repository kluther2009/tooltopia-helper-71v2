import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Wrench, Calendar, DollarSign, StickyNote } from "lucide-react";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { ProjectToolsDialog } from "./ProjectToolsDialog";
import { ProjectMaterialsDialog } from "./ProjectMaterialsDialog";
import { useState } from "react";
import { Project } from "@/types/projects";
import { format } from "date-fns";

export function ProjectCard({ project }: { project: Project }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [isMaterialsDialogOpen, setIsMaterialsDialogOpen] = useState(false);

  const statusColors = {
    planned: "bg-yellow-100 text-yellow-800",
    ongoing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <Badge className={statusColors[project.status]} variant="secondary">
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
          {project.target_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(project.target_date), "MMM d, yyyy")}
            </div>
          )}
          {/* Update the total cost display to show even when it's 0 */}
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            {typeof project.total_cost === 'number' 
              ? `$${project.total_cost.toFixed(2)}`
              : '$0.00'
            }
          </div>
          {project.notes && (
            <div className="flex items-start text-sm text-muted-foreground mt-2">
              <StickyNote className="h-4 w-4 mr-1 mt-1 flex-shrink-0" />
              <p className="line-clamp-2">{project.notes}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMaterialsDialogOpen(true)}
          >
            <DollarSign className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsToolsDialogOpen(true)}
          >
            <Wrench className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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