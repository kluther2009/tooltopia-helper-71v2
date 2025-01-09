import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
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

        // Get existing tool data
        const { data: tool, error: toolError } = await supabase
          .from('tools')
          .select('*')
          .eq('id', toolId)
          .single();

        if (toolError) {
          console.error('Error fetching tool:', toolError);
          toast.error("Failed to fetch tool details");
          navigate('/');
          return;
        }

        // Get annotation data from navigation state or localStorage
        const annotationData = location.state?.annotationData || 
          localStorage.getItem('pendingAnnotation') ? 
            JSON.parse(localStorage.getItem('pendingAnnotation') || '{}') : 
            null;

        if (tool) {
          const hasAdditionalInfo = !!(tool.purchase_date || tool.warranty_length || tool.purchase_cost);
          setState({
            toolName: tool.name,
            primaryLocation: annotationData?.location || tool.location || '',
            subLocation: annotationData?.subLocation || tool.sub_location_a || '',
            specificLocation: tool.sub_location_b || '',
            status: tool.status || 'available',
            showAdditionalInfo: hasAdditionalInfo,
            purchaseDate: tool.purchase_date || '',
            warrantyLength: tool.warranty_length?.toString() || '',
            purchaseCost: tool.purchase_cost?.toString() || '',
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
  }, [toolId, navigate, location.state]);

  const updateTool = async (_e?: React.FormEvent, annotationData?: any): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to update tools");
        navigate('/login');
        return false;
      }

      // Get annotation data from parameter or localStorage
      const annotation = annotationData || 
        (localStorage.getItem('pendingAnnotation') ? 
          JSON.parse(localStorage.getItem('pendingAnnotation') || '{}') : 
          null);

      // Update tool
      const { error: toolError } = await supabase
        .from('tools')
        .update({
          location: state.primaryLocation,
          sub_location_a: state.subLocation || null,
          sub_location_b: state.specificLocation || null,
          status: state.status
        })
        .eq('id', toolId);

      if (toolError) throw toolError;

      // If we have annotation data, update that too
      if (annotation) {
        // First remove existing annotation
        await supabase
          .from('tool_annotations')
          .delete()
          .eq('tool_id', toolId);

        // Then create new annotation
        const { error: annotationError } = await supabase
          .from('tool_annotations')
          .insert([
            {
              photo_id: annotation.photoId,
              tool_id: toolId,
              coordinates: annotation.coordinates,
              user_id: session.user.id
            }
          ]);

        if (annotationError) {
          console.error('Error creating annotation:', annotationError);
          toast.error('Failed to update tool location');
          return false;
        }

        localStorage.removeItem('pendingAnnotation');
      }

      toast.success("Tool updated successfully");
      navigate('/tools');
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