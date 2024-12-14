import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Tool {
  id: string;
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance";
}

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const { toast } = useToast();

  const fetchTools = async () => {
    try {
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
        const transformedTools = data.map(tool => {
          // Construct location string only if sub-locations exist
          let location = tool.location;
          if (tool.sub_location_a) {
            location += ` > ${tool.sub_location_a}`;
          }
          if (tool.sub_location_b) {
            location += ` > ${tool.sub_location_b}`;
          }
          
          return {
            id: tool.id,
            name: tool.name,
            location: location,
            status: tool.status as "available" | "in-use" | "maintenance"
          };
        });
        console.log('Transformed tools:', transformedTools);
        setTools(transformedTools);
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

  const updateToolLocation = async (toolId: string, destinationLocation: string) => {
    try {
      const tool = tools.find(t => t.id === toolId);
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

      fetchTools();
    } catch (error) {
      console.error('Error in updateToolLocation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating tool location",
        variant: "destructive"
      });
    }
  };

  return {
    tools,
    fetchTools,
    updateToolLocation
  };
}