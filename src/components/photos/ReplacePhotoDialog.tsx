
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PhotoViewerDialog } from "./PhotoViewerDialog";
import { LocationPhoto } from "@/types/photos";
import { AnnotationCanvas } from "./canvas/AnnotationCanvas";
import { supabase } from "@/integrations/supabase/client";
import { useInitialInventoryPhotos } from "@/hooks/useInitialInventoryPhotos";
import { PhotoGrid } from "./PhotoGrid";

interface ReplacePhotoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReplacePhotoDialog({ isOpen, onClose }: ReplacePhotoDialogProps) {
  const [oldPhoto, setOldPhoto] = useState<LocationPhoto | null>(null);
  const [showPhotoSelector, setShowPhotoSelector] = useState(true);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const { photos, isLoading } = useInitialInventoryPhotos();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhotoFile(file);
    }
  };

  const fetchAnnotations = async (photoId: string) => {
    const { data, error } = await supabase
      .from('tool_annotations')
      .select(`
        id,
        coordinates,
        tool_id,
        tool:tools (
          name
        )
      `)
      .eq('photo_id', photoId);

    if (!error && data) {
      setAnnotations(data);
    }
  };

  const handlePhotoSelected = async (photo: LocationPhoto) => {
    setOldPhoto(photo);
    await fetchAnnotations(photo.id);
    setShowPhotoSelector(false);
  };

  const handleClose = () => {
    setOldPhoto(null);
    setNewPhotoFile(null);
    setShowPhotoSelector(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>Replace Photo</DialogTitle>
        </DialogHeader>

        {showPhotoSelector ? (
          <div className="space-y-4">
            <div className="min-h-[300px]">
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
                  onPhotoClick={handlePhotoSelected}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-video">
                {oldPhoto && (
                  <AnnotationCanvas
                    imageUrl={`${supabase.storage.from('location-photos').getPublicUrl(oldPhoto.file_path).data.publicUrl}`}
                    existingAnnotations={annotations}
                  />
                )}
              </div>
              <div className="relative aspect-video">
                {!newPhotoFile ? (
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Button variant="outline" onClick={() => document.getElementById('new-photo-upload')?.click()}>
                        Select New Photo
                      </Button>
                      <input
                        id="new-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>
                ) : (
                  <img
                    src={URL.createObjectURL(newPhotoFile)}
                    alt="New photo"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
