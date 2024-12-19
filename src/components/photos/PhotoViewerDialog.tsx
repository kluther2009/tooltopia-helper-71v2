import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocationPhoto } from "@/types/photos";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { AnnotationCanvas } from "./canvas/AnnotationCanvas";

interface PhotoViewerDialogProps {
  photo: LocationPhoto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoViewerDialog({ photo, isOpen, onClose }: PhotoViewerDialogProps) {
  const [annotations, setAnnotations] = useState<any[]>([]);

  useEffect(() => {
    if (photo?.id && isOpen) {
      fetchAnnotations();
    }
  }, [photo?.id, isOpen]);

  const fetchAnnotations = async () => {
    if (!photo?.id) return;

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
      .eq('photo_id', photo.id);

    if (!error && data) {
      setAnnotations(data);
    }
  };

  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{photo.location}</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video">
          <AnnotationCanvas
            imageUrl={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
            existingAnnotations={annotations}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">{photo.location}</h3>
          <p className="text-sm text-gray-500">
            Uploaded on: {new Date(photo.created_at).toLocaleDateString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}