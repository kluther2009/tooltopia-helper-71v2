import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tool {
  id: string;
  name: string;
  location: string;
  sub_location_a: string | null;
  sub_location_b: string | null;
  status: string;
  purchase_date: string | null;
  warranty_length: number | null;
  purchase_cost: number | null;
  warranty_file_path: string | null;
  receipt_file_path: string | null;
}

interface AnnotationData {
  photoId: string;
  location: string;
  subLocation: string | null;
  coordinates: { x: number; y: number; width: number; height: number };
}

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

export function useToolEditor(toolId: string | undefined) {
  const navigate = useNavigate();
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [annotationData, setAnnotationData] = useState<AnnotationData | null>(null);

  const fetchTool = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching tool:", error);
        toast.error("Failed to load tool");
        navigate("/");
        return;
      }

      if (data) {
        const hasAdditionalInfo = !!(data.purchase_date || data.warranty_length || data.purchase_cost);
        setState({
          toolName: data.name,
          primaryLocation: data.location || "",
          subLocation: data.sub_location_a || "",
          specificLocation: data.sub_location_b || "",
          status: data.status,
          showAdditionalInfo: hasAdditionalInfo,
          purchaseDate: data.purchase_date || "",
          warrantyLength: data.warranty_length?.toString() || "",
          purchaseCost: data.purchase_cost?.toString() || "",
          warrantyFile: null,
          receiptFile: null,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while loading the tool");
      navigate("/");
    }
  }, [navigate]);

  const checkForAnnotations = useCallback(async (id: string) => {
    try {
      console.log("[useToolEditor] Checking for annotations for tool:", id);
      const { data, error } = await supabase
        .from("tool_annotations")
        .select(`
          photo_id,
          location_photos!inner(location, sub_location),
          coordinates
        `)
        .eq("tool_id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching annotations:", error);
        return;
      }

      if (data) {
        console.log("[useToolEditor] Found annotation data:", data);
        const { location_photos, ...rest } = data;
        setAnnotationData({
          photoId: data.photo_id,
          location: location_photos.location,
          subLocation: location_photos.sub_location,
          coordinates: typeof data.coordinates === 'string' 
            ? JSON.parse(data.coordinates) 
            : data.coordinates,
        });
      }
    } catch (error) {
      console.error("Error in checkForAnnotations:", error);
    }
  }, []);

  useEffect(() => {
    const checkAuthAndFetchTool = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          toast.error("Please sign in to edit tools");
          navigate("/login");
          return;
        }

        if (!toolId) return;

        await Promise.all([
          fetchTool(toolId),
          checkForAnnotations(toolId)
        ]);
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while loading the tool");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchTool();
  }, [toolId, fetchTool, checkForAnnotations, navigate]);

  const updateTool = async (): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to update tools");
        navigate("/login");
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
      } else {
        updateData.purchase_date = null;
        updateData.warranty_length = null;
        updateData.purchase_cost = null;
        updateData.warranty_file_path = null;
        updateData.receipt_file_path = null;
      }

      const { error } = await supabase
        .from("tools")
        .update(updateData)
        .eq("id", toolId);

      if (error) throw error;

      toast.success("Tool updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating tool:", error);
      toast.error("Failed to update tool");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    state,
    setState,
    isLoading,
    isUpdating,
    updateTool,
    annotationData,
  };
}