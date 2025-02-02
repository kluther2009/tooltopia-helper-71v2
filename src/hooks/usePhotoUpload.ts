import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePhotoUpload(location: string, subLocation: string) {
  const [isUploading, setIsUploading] = useState(false);

  const moderateImage = async (url: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-image', {
        body: { imageUrl: url }
      });

      if (error) throw error;
      return data.isSafe;
    } catch (error) {
      console.error('Moderation error:', error);
      throw new Error('Failed to moderate image');
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Upload to temporary location first
      const fileExt = file.name.split('.').pop();
      const tempPath = `temp/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('location-photos')
        .upload(tempPath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for moderation
      const { data: { publicUrl } } = supabase.storage
        .from('location-photos')
        .getPublicUrl(tempPath);

      // Check if image is safe
      const isSafe = await moderateImage(publicUrl);

      if (!isSafe) {
        // Clean up temporary file
        await supabase.storage
          .from('location-photos')
          .remove([tempPath]);
        
        toast.error('Image contains inappropriate content');
        return;
      }

      // Move to final location
      const finalPath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: moveError } = await supabase.storage
        .from('location-photos')
        .move(tempPath, finalPath);

      if (moveError) throw moveError;

      const { error: dbError } = await supabase
        .from('location_photos')
        .insert({
          location: location.trim(),
          sub_location: subLocation.trim() || null,
          file_path: finalPath,
          user_id: user.id,
          is_initial_inventory: true
        });

      if (dbError) throw dbError;

      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadPhoto(file);
  };

  const handleCameraCapture = async (file: File) => {
    await uploadPhoto(file);
  };

  return {
    isUploading,
    handleFileSelect,
    handleCameraCapture
  };
}