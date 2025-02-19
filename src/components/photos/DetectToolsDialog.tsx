
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useInitialInventoryPhotos } from "@/hooks/useInitialInventoryPhotos";
import { PhotoGrid } from "./PhotoGrid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LocationPhoto } from "@/types/photos";

interface DetectToolsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DetectToolsDialog({ isOpen, onClose }: DetectToolsDialogProps) {
  const { photos, isLoading } = useInitialInventoryPhotos();
  const [detecting, setDetecting] = useState(false);

  const handlePhotoSelect = async (photo: LocationPhoto) => {
    try {
      setDetecting(true);
      
      // Get the public URL of the photo
      const { data: { publicUrl } } = supabase.storage
        .from('location-photos')
        .getPublicUrl(photo.file_path);

      console.log('Calling detect-tools with URL:', publicUrl);

      // Call our edge function
      const { data, error } = await supabase.functions.invoke('detect-tools', {
        body: { imageUrl: publicUrl }
      });

      console.log('Response from detect-tools:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from edge function');
      }

      // Display results
      if (data.tools && data.tools.length > 0) {
        toast.success(`Detected ${data.tools.length} tools in the photo`);
        console.log('Detected tools:', data.tools);
        
        // Show each detected tool
        data.tools.forEach((item: { box_2d: number[], label: string }) => {
          toast.info(`Found: ${item.label}`);
        });
      } else {
        toast.info('No tools detected in this photo');
      }

    } catch (error) {
      console.error('Error detecting tools:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to detect tools in photo');
    } finally {
      setDetecting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Photo to Detect Tools</DialogTitle>
        </DialogHeader>
        <div className="min-h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading photos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>No photos available. Please upload some photos first.</p>
            </div>
          ) : (
            <PhotoGrid 
              photos={photos}
              onPhotoClick={handlePhotoSelect}
              disabled={detecting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
