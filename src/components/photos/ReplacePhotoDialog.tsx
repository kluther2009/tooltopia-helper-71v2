import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LocationPhoto } from "@/types/photos";
import { AnnotationCanvas } from "./canvas/AnnotationCanvas";
import { supabase } from "@/integrations/supabase/client";
import { useInitialInventoryPhotos } from "@/hooks/useInitialInventoryPhotos";
import { PhotoGrid } from "./PhotoGrid";
import { toast } from "sonner";

interface ReplacePhotoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReplacePhotoDialog({ isOpen, onClose }: ReplacePhotoDialogProps) {
  const [oldPhoto, setOldPhoto] = useState<LocationPhoto | null>(null);
  const [newPhoto, setNewPhoto] = useState<LocationPhoto | null>(null);
  const [step, setStep] = useState<'select-old' | 'select-new' | 'compare'>('select-old');
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [transferredAnnotations, setTransferredAnnotations] = useState<any[]>([]);
  const { photos, isLoading, handleDeletePhoto } = useInitialInventoryPhotos();

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

  const handleOldPhotoSelected = async (photo: LocationPhoto) => {
    setOldPhoto(photo);
    await fetchAnnotations(photo.id);
    setStep('select-new');
  };

  const handleNewPhotoSelected = (photo: LocationPhoto) => {
    setNewPhoto(photo);
    setStep('compare');
  };

  const handleClose = () => {
    setOldPhoto(null);
    setNewPhoto(null);
    setStep('select-old');
    setTransferredAnnotations([]);
    onClose();
  };

  const handleAnnotationDrop = async (annotation: any, newCoordinates: any) => {
    if (!newPhoto) return;

    try {
      const { error } = await supabase
        .from('temp_annotation_transfers')
        .insert({
          original_annotation_id: annotation.id,
          new_photo_id: newPhoto.id,
          coordinates: newCoordinates
        });

      if (error) throw error;

      setTransferredAnnotations([...transferredAnnotations, {
        ...annotation,
        coordinates: newCoordinates
      }]);

      toast.success('Annotation transferred successfully');
    } catch (error) {
      console.error('Error transferring annotation:', error);
      toast.error('Failed to transfer annotation');
    }
  };

  const handleAnnotationDelete = async (annotation: any) => {
    try {
      const { error } = await supabase
        .from('tool_annotations')
        .delete()
        .eq('id', annotation.id);

      if (error) throw error;

      setAnnotations(annotations.filter(a => a.id !== annotation.id));
      toast.success('Annotation deleted successfully');
    } catch (error) {
      console.error('Error deleting annotation:', error);
      toast.error('Failed to delete annotation');
    }
  };

  const handleConfirmReplacement = async () => {
    if (!oldPhoto || !newPhoto) return;

    try {
      for (const annotation of transferredAnnotations) {
        const { error } = await supabase
          .from('tool_annotations')
          .update({
            photo_id: newPhoto.id,
            coordinates: annotation.coordinates,
            moved: true
          })
          .eq('id', annotation.id);

        if (error) throw error;
      }

      toast.success('Photo replacement completed successfully');
      handleClose();
    } catch (error) {
      console.error('Error confirming replacement:', error);
      toast.error('Failed to complete photo replacement');
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'select-old':
      case 'select-new':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {step === 'select-old' ? 'Select Old Photo to Replace' : 'Select New Photo'}
            </h2>
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
                  photos={photos.filter(p => p.id !== oldPhoto?.id)}
                  onPhotoClick={step === 'select-old' ? handleOldPhotoSelected : handleNewPhotoSelected}
                  onDeleteClick={handleDeletePhoto}
                />
              )}
            </div>
          </div>
        );
      
      case 'compare':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 h-[calc(100vh-12rem)]">
              <div className="relative h-full">
                {oldPhoto && (
                  <div className="relative h-full">
                    <AnnotationCanvas
                      imageUrl={`${supabase.storage.from('location-photos').getPublicUrl(oldPhoto.file_path).data.publicUrl}`}
                      existingAnnotations={annotations}
                      onAnnotationDragEnd={handleAnnotationDrop}
                      onAnnotationDelete={handleAnnotationDelete}
                      isDraggable
                    />
                    <div className="absolute top-0 left-0 bg-black/50 text-white px-2 py-1 text-sm">
                      Old Photo (Drag annotations to transfer)
                    </div>
                  </div>
                )}
              </div>
              <div className="relative h-full">
                {newPhoto && (
                  <div className="relative h-full">
                    <AnnotationCanvas
                      imageUrl={`${supabase.storage.from('location-photos').getPublicUrl(newPhoto.file_path).data.publicUrl}`}
                      existingAnnotations={transferredAnnotations}
                      isDropTarget
                    />
                    <div className="absolute top-0 left-0 bg-black/50 text-white px-2 py-1 text-sm">
                      New Photo (Drop annotations here)
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setStep('select-new')}>
                Select Different Photo
              </Button>
              <Button onClick={handleConfirmReplacement} disabled={transferredAnnotations.length === 0}>
                Confirm Replacement
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>Replace Photo</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
