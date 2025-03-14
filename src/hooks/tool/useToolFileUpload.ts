
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useToolFileUpload = () => {
  const uploadFile = async (file: File, toolId: string, type: 'warranty'): Promise<string | null> => {
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

  return { uploadFile };
};
