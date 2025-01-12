import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectMaterial } from "../types";

export function useMaterialCost(projectId: string) {
  const queryClient = useQueryClient();

  const calculateTotalCost = (materialsToCalculate: ProjectMaterial[]) => {
    const total = materialsToCalculate.reduce(
      (sum, material) => sum + material.cost * material.quantity,
      0
    );
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

  return {
    calculateTotalCost,
    updateProjectTotalCost,
  };
}