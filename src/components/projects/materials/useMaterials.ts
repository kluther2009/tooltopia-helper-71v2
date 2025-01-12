import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectMaterial, NewMaterial } from "./types";
import { useMaterialValidation } from "./hooks/useMaterialValidation";
import { useMaterialCost } from "./hooks/useMaterialCost";

export function useMaterials(projectId: string) {
  const [materials, setMaterials] = useState<ProjectMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState<NewMaterial>({
    name: "",
    cost: "",
    quantity: "1",
  });

  const { validateNewMaterial, validateMaterialLimit } = useMaterialValidation();
  const { updateProjectTotalCost } = useMaterialCost(projectId);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("project_materials")
      .select("*")
      .eq("project_id", projectId);

    if (error) {
      toast.error("Failed to load materials");
      return [];
    }

    setMaterials(data);
    return data;
  };

  const handleMaterialChange = (field: string, value: string) => {
    setNewMaterial({ ...newMaterial, [field]: value });
  };

  const resetNewMaterialForm = () => {
    setNewMaterial({ name: "", cost: "", quantity: "1" });
  };

  const handleAddMaterial = async () => {
    if (!validateNewMaterial(newMaterial)) return;
    if (!validateMaterialLimit(materials.length)) return;

    const { data, error } = await supabase
      .from("project_materials")
      .insert({
        project_id: projectId,
        name: newMaterial.name,
        cost: parseFloat(newMaterial.cost),
        quantity: parseInt(newMaterial.quantity),
      })
      .select();

    if (error) {
      toast.error("Failed to add material");
      return;
    }

    toast.success("Material added successfully");
    resetNewMaterialForm();
    const updatedMaterials = await fetchMaterials();
    await updateProjectTotalCost(updatedMaterials);
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
    await updateProjectTotalCost(updatedMaterials);
  };

  useEffect(() => {
    if (projectId) {
      fetchMaterials().then((materials) => {
        updateProjectTotalCost(materials);
      });
    }
  }, [projectId]);

  return {
    materials,
    newMaterial,
    handleMaterialChange,
    handleAddMaterial,
    handleDeleteMaterial,
  };
}