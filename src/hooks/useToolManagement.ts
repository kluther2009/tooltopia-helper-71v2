
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useToolManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const checkToolExists = async (name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('name')
        .ilike('name', name);

      if (error) {
        console.error('Error checking tool existence:', error);
        return false;
      }

      return data.length > 0;
    } catch (error) {
      console.error('Error in checkToolExists:', error);
      return false;
    }
  };

  const addTool = async ({
    name,
    primaryLocation,
    subLocation,
    specificLocation,
    status,
    purchaseDate,
    warrantyLength,
    purchaseCost,
    warrantyFile,
    receiptFile
  }: {
    name: string;
    primaryLocation: string;
    subLocation: string;
    specificLocation: string;
    status: string;
    purchaseDate?: string;
    warrantyLength?: number;
    purchaseCost?: number;
    warrantyFile?: File;
    receiptFile?: File;
  }) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to add a tool");
        return false;
      }

      console.log('Adding tool with location:', {
        primaryLocation,
        subLocation
      });

      const exists = await checkToolExists(name);
      if (exists) {
        toast.error("A tool with this name already exists");
        return false;
      }

      const { error } = await supabase
        .from('tools')
        .insert([{
          name: name.trim(),
          location: primaryLocation,
          sub_location_a: subLocation || null,
          sub_location_b: specificLocation || null,
          status,
          user_id: user.id,
          purchase_date: purchaseDate || null,
          warranty_length: warrantyLength || null,
          purchase_cost: purchaseCost || null
        }]);

      if (error) throw error;

      toast.success("Tool added successfully");
      return true;
    } catch (error) {
      console.error('Error adding tool:', error);
      toast.error("Failed to add tool");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    checkToolExists,
    addTool
  };
}
