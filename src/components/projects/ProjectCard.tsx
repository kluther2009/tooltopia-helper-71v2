import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Project } from "@/types/projects";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { ProjectToolsDialog } from "./ProjectToolsDialog";
import { ProjectMaterialsDialog } from "./ProjectMaterialsDialog";
import { ProjectHeader } from "./project-card/ProjectHeader";
import { ProjectTools } from "./project-card/ProjectTools";
import { ProjectMaterials } from "./project-card/ProjectMaterials";

export function ProjectCard({ project }: { project: Project }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [isMaterialsDialogOpen, setIsMaterialsDialogOpen] = useState(false);

  return (
    <Card className="p-4 bg-slate-800 text-white">
      <div className="space-y-4">
        <ProjectHeader 
          project={project}
          onEditClick={() => setIsEditDialogOpen(true)}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
          onToolsClick={() => setIsToolsDialogOpen(true)}
          onMaterialsClick={() => setIsMaterialsDialogOpen(true)}
        />

        <div className="grid grid-cols-2 gap-4 pt-2">
          <ProjectMaterials projectId={project.id} />
          <ProjectTools projectId={project.id} />
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