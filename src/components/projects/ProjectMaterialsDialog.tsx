import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project } from "@/types/projects";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ProjectMaterial {
  id: string;
  name: string;
  cost: number;
  quantity: number;
}

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
  const [materials, setMaterials] = useState<ProjectMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    cost: "",
    quantity: "1",
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      fetchMaterials();
    }
  }, [open]);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("project_materials")
      .select("*")
      .eq("project_id", project.id);

    if (error) {
      toast.error("Failed to load materials");
      return [];
    }

    setMaterials(data);
    return data;
  };

  const calculateTotalCost = (materialsToCalculate: ProjectMaterial[]) => {
    return materialsToCalculate.reduce(
      (sum, material) => sum + material.cost * material.quantity,
      0
    );
  };

  const updateProjectTotalCost = async (materialsToUpdate: ProjectMaterial[]) => {
    const totalCost = calculateTotalCost(materialsToUpdate);

    const { error } = await supabase
      .from("projects")
      .update({ total_cost: totalCost })
      .eq("id", project.id);

    if (error) {
      toast.error("Failed to update project total cost");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const resetNewMaterialForm = () => {
    setNewMaterial({ name: "", cost: "", quantity: "1" });
  };

  const validateNewMaterial = () => {
    if (!newMaterial.name || !newMaterial.cost) {
      toast.error("Please fill in all fields");
      return false;
    }
    return true;
  };

  const handleAddMaterial = async () => {
    if (!validateNewMaterial()) return;

    const { error } = await supabase.from("project_materials").insert({
      project_id: project.id,
      name: newMaterial.name,
      cost: parseFloat(newMaterial.cost),
      quantity: parseInt(newMaterial.quantity),
    });

    if (error) {
      toast.error("Failed to add material");
      return;
    }

    toast.success("Material added successfully");
    resetNewMaterialForm();
    const updatedMaterials = await fetchMaterials();
    updateProjectTotalCost(updatedMaterials);
  };

  const handleDeleteMaterial = async (id: string) => {
    const { error } = await supabase
      .from("project_materials")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete material");
      return;
    }

    toast.success("Material deleted successfully");
    const updatedMaterials = materials.filter((m) => m.id !== id);
    setMaterials(updatedMaterials);
    updateProjectTotalCost(updatedMaterials);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Materials</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-2">
              <Label>Name</Label>
              <Label>Cost ($)</Label>
              <Label>Quantity</Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Material name"
                value={newMaterial.name}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, name: e.target.value })
                }
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Cost"
                value={newMaterial.cost}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, cost: e.target.value })
                }
              />
              <Input
                type="number"
                min="1"
                placeholder="Quantity"
                value={newMaterial.quantity}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, quantity: e.target.value })
                }
              />
            </div>
            <Button onClick={handleAddMaterial} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>

          <div className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <p className="font-medium">{material.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${material.cost.toFixed(2)} × {material.quantity}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMaterial(material.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}