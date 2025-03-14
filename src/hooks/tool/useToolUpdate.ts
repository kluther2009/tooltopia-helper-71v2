
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ToolEditorState } from "../useToolEditor";
import { mapToolStateToApiData } from "./useToolDataMapping";
import { useToolFileUpload } from "./useToolFileUpload";

export const useToolUpdate = (toolId: string | undefined) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { uploadFile } = useToolFileUpload();

  const updateTool = async (state: ToolEditorState): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to update tools");
        navigate('/login');
        return false;
      }

      console.log('Updating tool with state:', state);

      const updateData = mapToolStateToApiData(state, toolId);

      if (state.showAdditionalInfo && state.warrantyFile) {
        const warrantyPath = await uploadFile(state.warrantyFile, toolId!, 'warranty');
        if (warrantyPath) {
          updateData.warranty_file_path = warrantyPath;
        }
      }

      const { error } = await supabase
        .from('tools')
        .update(updateData)
        .eq('id', toolId);

      if (error) throw error;

      toast.success("Tool updated successfully");
      return true;
    } catch (error) {
      console.error('Error updating tool:', error);
      toast.error("Failed to update tool");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateTool, isUpdating };
};
