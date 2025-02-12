
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePhotoUpload(location: string, subLocation: string) {
  const [isUploading, setIsUploading] = useState(false);

  const moderateImage = async (url: string) => {
    try {
      console.log('Starting moderation for URL:', url);
      const { data, error } = await supabase.functions.invoke('moderate-image', {
        body: { imageUrl: url }
      });

      if (error) {
        console.error('Moderation error details:', error);
        throw error;
      }

      console.log('Moderation response:', data);
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

    console.log('Starting upload for file:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type
    });

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Upload to temporary location first
      const fileExt = file.name.split('.').pop();
      const tempPath = `temp/${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading to temporary path:', tempPath);
      const { error: uploadError } = await supabase.storage
        .from('location-photos')
        .upload(tempPath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for moderation
      const { data: { publicUrl } } = supabase.storage
        .from('location-photos')
        .getPublicUrl(tempPath);

      console.log('Temporary file uploaded, getting public URL:', publicUrl);

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
      console.log('Moving file to final path:', finalPath);

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

      console.log('Upload completed successfully');
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
    console.log('File selected:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type
    });
    await uploadPhoto(file);
  };

  const handleCameraCapture = async (file: File) => {
    console.log('Camera capture:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type
    });
    await uploadPhoto(file);
  };

  return {
    isUploading,
    handleFileSelect,
    handleCameraCapture
  };
}
