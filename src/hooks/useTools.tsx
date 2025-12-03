import { useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Tool {
  id: string;
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "loaned";
  purchase_date?: string | null;
  warranty_length?: number | null;
  warranty_file_path?: string | null;
  sub_location_a?: string | null;
  sub_location_b?: string | null;
  purchase_cost?: number | null;
  last_maintenance_date?: string | null;
  maintenance_period_months?: number | null;
}

export function useTools() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchToolsData = async () => {
    console.log('Fetching tools...');
    const { data, error } = await supabase
      .from('tools')
      .select('*');

    if (error) {
      console.error('Error fetching tools:', error);
      throw error;
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
          status: tool.status as "available" | "in-use" | "maintenance" | "loaned",
          purchase_date: tool.purchase_date,
          warranty_length: tool.warranty_length,
          warranty_file_path: tool.warranty_file_path,
          sub_location_a: tool.sub_location_a,
          sub_location_b: tool.sub_location_b,
          purchase_cost: tool.purchase_cost,
          last_maintenance_date: tool.last_maintenance_date,
          maintenance_period_months: tool.maintenance_period_months
        };
      });
      console.log('Tools fetched successfully:', transformedTools);
      return transformedTools;
    }
    return [];
  };

  const { data: tools = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tools"],
    queryFn: fetchToolsData,
    meta: {
      errorMessage: "Failed to fetch tools"
    }
  });

  // Set up a subscription to tool changes
  // We use useEffect here to set up the subscription once
  // When a change happens, we invalidate the query to trigger a refetch
  useEffect(() => {
    const toolsSubscription = supabase
      .channel('tools-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tools'
      }, () => {
        console.log('Tools table changed, refreshing data...');
        queryClient.invalidateQueries({ queryKey: ["tools"] });
      })
      .subscribe();

    return () => {
      toolsSubscription.unsubscribe();
    };
  }, [queryClient]);

  /**
   * Updates the location of a tool in the database.
   * @param toolId The ID of the tool to update.
   * @param destinationLocation The new location string (e.g., "Garage > Shelf A").
   */
  const updateToolLocation = useCallback(async (toolId: string, destinationLocation: string) => {
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

      // Invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    } catch (error) {
      console.error('Error in updateToolLocation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating tool location",
        variant: "destructive"
      });
    }
  }, [tools, queryClient, toast]);

  /**
   * Manually invalidates the tools query to force a refresh.
   */
  const invalidateTools = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tools"] });
  }, [queryClient]);

  return {
    tools,
    isLoading,
    error,
    fetchTools: refetch, // Alias refetch to fetchTools for compatibility
    updateToolLocation,
    invalidateTools
  };
}
