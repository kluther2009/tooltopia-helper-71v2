
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useToolFileUpload } from "./useToolFileUpload";

export const useToolSubmission = (toolId: string | undefined) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { uploadFile } = useToolFileUpload();

  const updateTool = async (state, annotationData = null) => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to update tools");
        navigate('/login');
        return false;
      }

      console.log('Updating tool with state:', state);
      console.log('Annotation data for location update:', annotationData);

      // Prepare the update data
      const updateData = {
        name: state.toolName.trim(),
        location: state.primaryLocation,
        sub_location_a: state.subLocation || null,
        sub_location_b: state.specificLocation || null,
        status: state.status,
        loaned_to: state.loanedTo || null,
        loan_date: state.loanDate || null,
        user_id: session.user.id,
        purchase_date: state.showAdditionalInfo ? state.purchaseDate || null : null,
        warranty_length: state.showAdditionalInfo && state.warrantyLength ? parseInt(state.warrantyLength) : null,
        purchase_cost: state.showAdditionalInfo && state.purchaseCost ? parseFloat(state.purchaseCost) : null,
        last_maintenance_date: state.lastMaintenanceDate || null,
        maintenance_period_months: state.maintenancePeriod ? parseInt(state.maintenancePeriod) : null,
        manual_id: state.manualId || null,
        warranty_file_path: null  // Initialize with null, will be updated if needed
      };
      
      // Override location from annotation data if available
      if (annotationData && annotationData.location) {
        console.log('Overriding location with annotation data:', annotationData.location);
        updateData.location = annotationData.location;
        
        if (annotationData.sub_location) {
          updateData.sub_location_a = annotationData.sub_location;
        }
      }

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
