import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  receiptFile: File | null;
}

export const useToolEditor = (toolId: string | undefined) => {
  const [state, setState] = useState<ToolEditorState>({
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
    receiptFile: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchTool = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          toast.error("Please sign in to edit tools");
          navigate('/login');
          return;
        }

        if (!toolId) return;

        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('id', toolId)
          .single();

        if (error) {
          console.error('Error fetching tool:', error);
          toast.error("Failed to fetch tool details");
          navigate('/');
          return;
        }

        if (data) {
          const hasAdditionalInfo = !!(data.purchase_date || data.warranty_length || data.purchase_cost);
          setState({
            toolName: data.name,
            primaryLocation: data.location || '',
            subLocation: data.sub_location_a || '',
            specificLocation: data.sub_location_b || '',
            status: data.status,
            showAdditionalInfo: hasAdditionalInfo,
            purchaseDate: data.purchase_date || '',
            warrantyLength: data.warranty_length?.toString() || '',
            purchaseCost: data.purchase_cost?.toString() || '',
            warrantyFile: null,
            receiptFile: null,
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("An error occurred while loading the tool");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchTool();
  }, [toolId, navigate]);

  const uploadFile = async (file: File, type: 'warranty' | 'receipt'): Promise<string | null> => {
    if (!file || !toolId) return null;

    try {
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const filePath = `${toolId}/${type}_${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('warranty-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error(`Error uploading ${type} file:`, uploadError);
        toast.error(`Failed to upload ${type} file`);
        return null;
      }

      return filePath;
    } catch (error) {
      console.error(`Error in uploadFile:`, error);
      toast.error(`Failed to upload ${type} file`);
      return null;
    }
  };

  const updateTool = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to update tools");
        navigate('/login');
        return false;
      }

      const updateData: any = {
        name: state.toolName,
        location: state.primaryLocation,
        sub_location_a: state.subLocation || null,
        sub_location_b: state.specificLocation || null,
        status: state.status,
      };

      if (state.showAdditionalInfo) {
        updateData.purchase_date = state.purchaseDate || null;
        updateData.warranty_length = state.warrantyLength ? parseInt(state.warrantyLength) : null;
        updateData.purchase_cost = state.purchaseCost ? parseFloat(state.purchaseCost) : null;

        if (state.warrantyFile) {
          const warrantyPath = await uploadFile(state.warrantyFile, 'warranty');
          if (warrantyPath) {
            updateData.warranty_file_path = warrantyPath;
          }
        }

        if (state.receiptFile) {
          const receiptPath = await uploadFile(state.receiptFile, 'receipt');
          if (receiptPath) {
            updateData.receipt_file_path = receiptPath;
          }
        }
      } else {
        updateData.purchase_date = null;
        updateData.warranty_length = null;
        updateData.purchase_cost = null;
        updateData.warranty_file_path = null;
        updateData.receipt_file_path = null;
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
    }
  };

  return {
    state,
    setState,
    isLoading,
    updateTool,
  };
};