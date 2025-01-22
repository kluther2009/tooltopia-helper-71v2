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
import { Button } from "../ui/button";
import { MessageSquare, ListPlus, Image } from "lucide-react";
import { ProjectPhotoCameraDialog } from "./photos/ProjectPhotoCameraDialog";
import { ProjectPhotosList } from "./photos/ProjectPhotosList";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function ProjectCard({ project }: { project: Project }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [isMaterialsDialogOpen, setIsMaterialsDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [showProjectHelper, setShowProjectHelper] = useState(false);
  const [isPhotoCameraOpen, setIsPhotoCameraOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: photos = [], isError } = useQuery({
    queryKey: ["project-photos", project.id],
    queryFn: async () => {
      if (!project.id) {
        throw new Error("Project ID is required");
      }

      const { data, error } = await supabase
        .from("project_photos")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching photos:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!project.id, // Only run query if project.id exists
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!project.id) {
        throw new Error("Project ID is required");
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${project.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      const { error: dbError } = await supabase
        .from('project_photos')
        .insert({
          project_id: project.id,
          file_path: filePath,
        });

      if (dbError) {
        console.error("Error inserting photo record:", dbError);
        throw dbError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-photos", project.id] });
      toast.success("Photo added successfully");
      setIsPhotoCameraOpen(false);
    },
    onError: (error) => {
      console.error("Error in photo mutation:", error);
      toast.error("Failed to upload photo");
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { data: photo } = await supabase
        .from("project_photos")
        .select("file_path")
        .eq("id", photoId)
        .single();

      if (photo) {
        const { error: storageError } = await supabase.storage
          .from('project-photos')
          .remove([photo.file_path]);
          
        if (storageError) {
          console.error("Error removing file from storage:", storageError);
          throw storageError;
        }
      }

      const { error } = await supabase
        .from("project_photos")
        .delete()
        .eq("id", photoId);

      if (error) {
        console.error("Error deleting photo record:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-photos", project.id] });
      toast.success("Photo deleted successfully");
    },
    onError: (error) => {
      console.error("Error in delete mutation:", error);
      toast.error("Failed to delete photo");
    },
  });

  const handlePhotoCapture = async (file: File) => {
    uploadPhotoMutation.mutate(file);
  };

  if (isError) {
    toast.error("Failed to load project photos");
  }

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

        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">Photos</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPhotoCameraOpen(true)}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Image className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
          <ProjectPhotosList
            projectId={project.id}
            photos={photos}
            onDeletePhoto={(photoId) => deletePhotoMutation.mutate(photoId)}
          />
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
      <ProjectPhotoCameraDialog
        isOpen={isPhotoCameraOpen}
        onClose={() => setIsPhotoCameraOpen(false)}
        onCapture={handlePhotoCapture}
      />
    </Card>
  );
}