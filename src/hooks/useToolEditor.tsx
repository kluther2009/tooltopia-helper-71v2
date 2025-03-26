
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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
  warrantyFilePath?: string | null;
  loanedTo: string | null;
  loanDate: string | null;
  manualId: string | null;
  lastMaintenanceDate: string | null;
  maintenancePeriod: string | null;
}

const defaultState: ToolEditorState = {
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

export function useToolEditor(toolId: string | undefined) {
  const [editorState, setEditorState] = useState<ToolEditorState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const [isToolLoaded, setIsToolLoaded] = useState(false);
  const navigate = useNavigate();
  const toolUpdate = useToolUpdate(toolId);

  const setState = (newState: React.SetStateAction<ToolEditorState>) => {
    setEditorState((prevState) => {
      const updatedState =
        typeof newState === "function" ? newState(prevState) : newState;
      return updatedState;
    });
  };

  const fetchTool = async () => {
    if (!toolId) {
      toast.error("No tool selected");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("id", toolId)
        .single();

      if (error) {
        console.error("Error fetching tool:", error);
        toast.error("Failed to load tool");
        navigate("/tool-overview");
        return;
      }

      if (data) {
        setEditorState({
          toolName: data.name,
          primaryLocation: data.location || "",
          subLocation: data.sub_location_a || "",
          specificLocation: data.sub_location_b || "",
          status: data.status,
          showAdditionalInfo: !!(
            data.purchase_date || data.warranty_length || data.purchase_cost
          ),
          purchaseDate: data.purchase_date || "",
          warrantyLength: data.warranty_length?.toString() || "",
          purchaseCost: data.purchase_cost?.toString() || "",
          warrantyFile: null,
          warrantyFilePath: data.warranty_file_path,
          loanedTo: data.loaned_to || null,
          loanDate: data.loan_date || null,
          manualId: data.manual_id || null,
          lastMaintenanceDate: data.last_maintenance_date || null,
          maintenancePeriod: data.maintenance_period_months?.toString() || null,
        });
        setIsToolLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching tool:", error);
      toast.error("Failed to load tool");
      navigate("/tool-overview");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTool = async (state?: ToolEditorState, annotationData?: any) => {
    if (!toolId) {
      toast.error("No tool selected");
      return false;
    }

    try {
      if (!editorState && !state) {
        toast.error("No changes to save");
        return false;
      }

      const stateToUpdate = state || editorState;
      const success = await toolUpdate.updateTool(stateToUpdate, annotationData);
      
      if (success) {
        fetchTool();
      }
      
      return success;
    } catch (error) {
      console.error("Error updating tool:", error);
      toast.error("Failed to update tool");
      return false;
    }
  };

  useEffect(() => {
    fetchTool();
  }, [toolId]);

  return {
    state: editorState,
    setState,
    isLoading,
    updateTool,
    isToolLoaded,
  };
}
