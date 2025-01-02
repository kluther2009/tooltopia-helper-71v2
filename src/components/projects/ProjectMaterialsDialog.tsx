import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project } from "@/types/projects";
import { MaterialForm } from "./materials/MaterialForm";
import { MaterialList } from "./materials/MaterialList";
import { useMaterials } from "./materials/useMaterials";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectMaterialsDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectMaterialsDialog({
  project,
  open,
  onOpenChange,
}: ProjectMaterialsDialogProps) {
  const queryClient = useQueryClient();
  
  const {
    materials,
    newMaterial,
    handleMaterialChange,
    handleAddMaterial,
    handleDeleteMaterial,
  } = useMaterials(project.id);

  const handleClose = () => {
    onOpenChange(false);
    // Invalidate both projects and project-materials queries
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["project-materials", project.id] });
    queryClient.invalidateQueries({ queryKey: ["project-tools-list", project.id] });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Materials</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <MaterialForm
            newMaterial={newMaterial}
            onMaterialChange={handleMaterialChange}
            onAddMaterial={handleAddMaterial}
            onCancel={handleClose}
          />
          <MaterialList
            materials={materials}
            onDeleteMaterial={handleDeleteMaterial}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}