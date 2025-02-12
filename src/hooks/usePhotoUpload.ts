
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_MODERATION_SIZE = 4 * 1024 * 1024; // 4MB for Azure moderation

export function usePhotoUpload(location: string, subLocation: string) {
  const [isUploading, setIsUploading] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    console.log('Starting compression. Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Start with high quality
          let quality = 0.9;
          let output = canvas.toDataURL('image/jpeg', quality);
          let byteSize = Math.ceil((output.length * 3) / 4); // base64 size to byte size

          console.log('Initial compressed size:', (byteSize / 1024 / 1024).toFixed(2), 'MB with quality:', quality);

          // Reduce quality until file is under MAX_MODERATION_SIZE
          while (byteSize > MAX_MODERATION_SIZE && quality > 0.1) {
            quality -= 0.1;
            output = canvas.toDataURL('image/jpeg', quality);
            byteSize = Math.ceil((output.length * 3) / 4);
            console.log('Trying quality:', quality.toFixed(1), 'new size:', (byteSize / 1024 / 1024).toFixed(2), 'MB');
          }

          // Convert base64 to File
          const byteString = atob(output.split(',')[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: 'image/jpeg' });
          const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });

          console.log('Final compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
          console.log('Compression ratio:', ((compressedFile.size / file.size) * 100).toFixed(1) + '%');
          
          resolve(compressedFile);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

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

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Compress image before upload
      const compressedFile = await compressImage(file);

      // Upload to temporary location first
      const fileExt = file.name.split('.').pop();
      const tempPath = `temp/${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading compressed file to temporary path:', tempPath);
      const { error: uploadError } = await supabase.storage
        .from('location-photos')
        .upload(tempPath, compressedFile);

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
