
import { useState } from "react";
import { useToolFetch } from "./tool/useToolFetch";
import { useToolUpdate } from "./tool/useToolUpdate";

export interface ToolEditorState {
  toolName: string;
  primaryLocation: string;
  subLocation: string;
  specificLocation: string;
  status: string;
  showAdditionalInfo: boolean;
  purchaseDate: string;
  warrantyLength: string;
  purchaseCost: string;
  warrantyFile: File | null;
  warrantyFilePath: string | null;
  loanedTo: string | null;
  loanDate: string | null;
  manualId: string | null;
  lastMaintenanceDate: string | null;
  maintenancePeriod: string | null;
}

const initialState: ToolEditorState = {
  toolName: "",
  primaryLocation: "",
  subLocation: "",
  specificLocation: "",
  status: "available",
  showAdditionalInfo: false,
  purchaseDate: "",
  warrantyLength: "",
  purchaseCost: "",
  warrantyFile: null,
  warrantyFilePath: null,
  loanedTo: null,
  loanDate: null,
  manualId: null,
  lastMaintenanceDate: null,
  maintenancePeriod: null,
};

export const useToolEditor = (toolId: string | undefined) => {
  const { isLoading, isToolLoaded, toolState } = useToolFetch(toolId);
  const [state, setState] = useState<ToolEditorState>(initialState);
  const { updateTool, isUpdating } = useToolUpdate(toolId);

  // Update state when tool data is loaded
  if (toolState && isToolLoaded && state === initialState) {
    setState(toolState);
  }

  const handleUpdateTool = async (): Promise<boolean> => {
    return await updateTool(state);
  };

  return {
    state,
    setState,
    isLoading,
    isToolLoaded,
    isUpdating,
    updateTool: handleUpdateTool,
  };
};
