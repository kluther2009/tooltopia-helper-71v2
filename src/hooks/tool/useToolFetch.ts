
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ToolEditorState } from "../useToolEditor";
import { mapApiDataToToolState } from "./useToolDataMapping";

export const useToolFetch = (toolId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isToolLoaded, setIsToolLoaded] = useState(false);
  const [toolState, setToolState] = useState<ToolEditorState | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchTool = async () => {
      try {
        setIsToolLoaded(false);
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
          .maybeSingle();

        if (error) {
          console.error('Error fetching tool:', error);
          toast.error("Failed to fetch tool details");
          navigate('/');
          return;
        }

        if (data) {
          setToolState(mapApiDataToToolState(data));
          setIsToolLoaded(true);
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

  return { isLoading, isToolLoaded, toolState };
};
