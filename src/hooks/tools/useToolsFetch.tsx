import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tool } from "../useTools";

export function useToolsFetch() {
  const [tools, setTools] = useState<Tool[]>([]);
  const { toast } = useToast();

  const fetchTools = async () => {
    try {
      console.log('Fetching tools...');
      const { data, error } = await supabase
        .from('tools')
        .select('*');
      
      if (error) {
        console.error('Error fetching tools:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tools",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        console.log('Tools fetched successfully:', data);
        setTools(data as Tool[]);
      }
    } catch (error) {
      console.error('Error in fetchTools:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching tools",
        variant: "destructive"
      });
    }
  };

  return {
    tools,
    setTools,
    fetchTools
  };
}