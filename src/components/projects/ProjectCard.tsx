import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Project } from "@/types/projects";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { ProjectToolsDialog } from "./ProjectToolsDialog";
import { ProjectMaterialsDialog } from "./ProjectMaterialsDialog";
import { ProjectTaskDialog } from "./tasks/ProjectTaskDialog";
import { ProjectHeader } from "./project-card/ProjectHeader";
import { ProjectTools } from "./project-card/ProjectTools";
import { ProjectMaterials } from "./project-card/ProjectMaterials";
import { ProjectTasksList } from "./tasks/ProjectTasksList";
import { ProjectHelper } from "./ProjectHelper";
import { ProjectPhotosDialog } from "./photos/ProjectPhotosDialog";
import { Button } from "../ui/button";
import { MessageSquare, ListPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProjectCard({ project }: { project: Project }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [isMaterialsDialogOpen, setIsMaterialsDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [showProjectHelper, setShowProjectHelper] = useState(false);
  const [isPhotosDialogOpen, setIsPhotosDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleViewPhotos = () => {
    setIsPhotosDialogOpen(false);
    // Navigate to photos view page - this will be implemented in the next step
    console.log("View photos for project:", project.id);
  };

  const handleUploadPhoto = () => {
    setIsPhotosDialogOpen(false);
    // Navigate to photo upload page - this will be implemented in the next step
    console.log("Upload photo for project:", project.id);
  };

  return (
    <Card className="p-4 bg-slate-800 text-white">
      <div className="space-y-4">
        <ProjectHeader 
          project={project}
          onEditClick={() => setIsEditDialogOpen(true)}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
          onToolsClick={() => setIsToolsDialogOpen(true)}
          onMaterialsClick={() => setIsMaterialsDialogOpen(true)}
          onPhotosClick={() => setIsPhotosDialogOpen(true)}
        />

        <div className="grid grid-cols-2 gap-4 pt-2">
          <ProjectMaterials projectId={project.id} />
          <ProjectTools projectId={project.id} />
        </div>

        {project.notes && (
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Project Notes:</h3>
            <div className="text-sm text-slate-300">
              {project.notes}
            </div>
          </div>
        )}

        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">Tasks</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTaskDialogOpen(true)}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <ListPlus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          <ProjectTasksList projectId={project.id} />
        </div>

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
      <ProjectTaskDialog
        project={project}
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
      />
      <ProjectPhotosDialog
        projectId={project.id}
        open={isPhotosDialogOpen}
        onOpenChange={setIsPhotosDialogOpen}
        onViewPhotos={handleViewPhotos}
        onUploadPhoto={handleUploadPhoto}
      />
    </Card>
  );
}