import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tool {
  id: string;
  name: string;
  location: string;
  status: string;
}

interface AddToolParams {
  name: string;
  primaryLocation: string;
  subLocation: string;
  specificLocation: string;
  status: string;
}

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
    status
  }: AddToolParams): Promise<Tool | null> => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to add a tool");
        return null;
      }

      const exists = await checkToolExists(name);
      if (exists) {
        toast.error("A tool with this name already exists");
        return null;
      }

      const fullLocation = `${primaryLocation}${subLocation ? ` > ${subLocation}` : ''}${specificLocation ? ` > ${specificLocation}` : ''}`;

      const { data, error } = await supabase
        .from('tools')
        .insert([{
          name: name.trim(),
          location: fullLocation,
          status,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Tool added successfully");
      return data as Tool;
    } catch (error) {
      console.error('Error adding tool:', error);
      toast.error("Failed to add tool");
      return null;
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