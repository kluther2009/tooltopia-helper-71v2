import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tool } from "../useTools";

export function useToolLocation() {
  const { toast } = useToast();

  const updateToolLocation = async (toolId: string, destinationLocation: string) => {
    try {
      const tool = await getToolById(toolId);
      if (!tool) return;

      // Split the destination location into its components
      const locationParts = destinationLocation.split(" > ").map(part => part.trim());
      const mainLocation = locationParts[0];
      const subLocationA = locationParts[1] || null;
      const subLocationB = locationParts[2] || null;

      console.log('Updating tool location:', {
        toolId,
        mainLocation,
        subLocationA,
        subLocationB
      });

      const { error } = await supabase
        .from('tools')
        .update({ 
          location: mainLocation,
          sub_location_a: subLocationA,
          sub_location_b: subLocationB
        })
        .eq('id', toolId);

      if (error) {
        console.error('Error updating tool location:', error);
        toast({
          title: "Error",
          description: "Failed to update tool location",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Moved ${tool.name} to ${destinationLocation}`,
      });

    } catch (error) {
      console.error('Error in updateToolLocation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating tool location",
        variant: "destructive"
      });
    }
  };

  const getToolById = async (toolId: string): Promise<Tool | null> => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', toolId)
      .single();

    if (error) {
      console.error('Error fetching tool:', error);
      return null;
    }

    return data as Tool;
  };

  return {
    updateToolLocation
  };
}