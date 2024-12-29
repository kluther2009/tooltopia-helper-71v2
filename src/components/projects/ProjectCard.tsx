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
import { ProjectHelper } from "./ProjectHelper";
import { Button } from "../ui/button";
import { MessageSquare } from "lucide-react";

export function ProjectCard({ project }: { project: Project }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [isMaterialsDialogOpen, setIsMaterialsDialogOpen] = useState(false);
  const [showProjectHelper, setShowProjectHelper] = useState(false);

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

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProjectHelper(!showProjectHelper)}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Project Helper
          </Button>
        </div>

        {showProjectHelper && (
          <div className="mt-4 border-t border-slate-700 pt-4">
            <ProjectHelper projectId={project.id} />
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