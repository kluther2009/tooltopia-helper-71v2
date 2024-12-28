import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectMaterial, NewMaterial } from "./types";

export function useMaterials(projectId: string) {
  const [materials, setMaterials] = useState<ProjectMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState<NewMaterial>({
    name: "",
    cost: "",
    quantity: "1",
  });
  const queryClient = useQueryClient();

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

  const calculateTotalCost = (materialsToCalculate: ProjectMaterial[]) => {
    const total = materialsToCalculate.reduce(
      (sum, material) => sum + (material.cost * material.quantity),
      0
    );
    // Round to 2 decimal places to avoid floating point precision issues
    return Number(total.toFixed(2));
  };

  const updateProjectTotalCost = async (materialsToUpdate: ProjectMaterial[]) => {
    const totalCost = calculateTotalCost(materialsToUpdate);
    console.log("Updating total cost to:", totalCost);

    const { error } = await supabase
      .from("projects")
      .update({ total_cost: totalCost })
      .eq("id", projectId);

    if (error) {
      console.error("Error updating total cost:", error);
      toast.error("Failed to update project total cost");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const handleMaterialChange = (field: string, value: string) => {
    setNewMaterial({ ...newMaterial, [field]: value });
  };

  const validateNewMaterial = () => {
    if (!newMaterial.name || !newMaterial.cost) {
      toast.error("Please fill in all fields");
      return false;
    }
    return true;
  };

  const resetNewMaterialForm = () => {
    setNewMaterial({ name: "", cost: "", quantity: "1" });
  };

  const handleAddMaterial = async () => {
    if (!validateNewMaterial()) return;

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