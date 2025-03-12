
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Project } from "@/types/projects";
import { MaterialForm } from "./materials/MaterialForm";
import { MaterialList } from "./materials/MaterialList";
import { useMaterials } from "./materials/useMaterials";
import { useQueryClient } from "@tanstack/react-query";
import { useMaterialValidation } from "./materials/hooks/useMaterialValidation";

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
  const { MAX_MATERIALS } = useMaterialValidation();
  
  const {
    materials,
    newMaterial,
    handleMaterialChange,
    handleAddMaterial,
    handleDeleteMaterial,
  } = useMaterials(project.id);

  const handleCancel = () => {
    onOpenChange(false);
    // Invalidate both projects and project-materials queries
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["project-materials", project.id] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex flex-col space-y-1">
            <DialogTitle>Project Materials</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {materials.length}/{MAX_MATERIALS} materials
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <MaterialForm
            newMaterial={newMaterial}
            materialsCount={materials.length}
            onMaterialChange={handleMaterialChange}
            onAddMaterial={handleAddMaterial}
            onCancel={handleCancel}
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
