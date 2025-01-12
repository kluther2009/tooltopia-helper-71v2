import { toast } from "sonner";
import { NewMaterial } from "../types";

const MAX_MATERIALS = 20;

export function useMaterialValidation() {
  const validateNewMaterial = (newMaterial: NewMaterial) => {
    if (!newMaterial.name || !newMaterial.cost) {
      toast.error("Please fill in all fields");
      return false;
    }
    return true;
  };

  const validateMaterialLimit = (currentCount: number) => {
    if (currentCount >= MAX_MATERIALS) {
      toast.error(`Cannot add more than ${MAX_MATERIALS} materials to a project`);
      return false;
    }
    return true;
  };

  return {
    validateNewMaterial,
    validateMaterialLimit,
    MAX_MATERIALS,
  };
}