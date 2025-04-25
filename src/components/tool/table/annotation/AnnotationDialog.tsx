
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { AnnotationImage } from "./AnnotationImage";
import { supabase } from "@/integrations/supabase/client";

interface Annotation {
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  photo: {
    file_path: string;
  } | null;
}

interface AnnotationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  annotation: Annotation | null;
}

export function AnnotationDialog({ isOpen, onOpenChange, annotation }: AnnotationDialogProps) {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [processedAnnotation, setProcessedAnnotation] = useState<Annotation | null>(null);

  useEffect(() => {
    if (annotation?.photo?.file_path && isOpen) {
      const { data } = supabase.storage
        .from('location-photos')
        .getPublicUrl(annotation.photo.file_path);
      
      if (data.publicUrl) {
        setPhotoUrl(data.publicUrl);
        
        // Process the annotation to ensure coordinates are valid
        const rawCoords = annotation.coordinates;
        const processedCoords = {
          x: typeof rawCoords.x === 'number' ? rawCoords.x : 0,
          y: typeof rawCoords.y === 'number' ? rawCoords.y : 0,
          width: typeof rawCoords.width === 'number' ? rawCoords.width : 0,
          height: typeof rawCoords.height === 'number' ? rawCoords.height : 0
        };
        
        setProcessedAnnotation({
          ...annotation,
          coordinates: processedCoords
        });
        
        console.log("Processed annotation:", {
          raw: annotation,
          processed: {
            ...annotation,
            coordinates: processedCoords
          }
        });
      }
    } else {
      setPhotoUrl(null);
      setProcessedAnnotation(null);
    }
  }, [annotation, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Tool Location</DialogTitle>
        <DialogDescription>
          View the location of this tool in the photo
        </DialogDescription>
        {isImageLoading && (
          <div className="text-center py-4">Loading image...</div>
        )}
        {imageError && (
          <div className="text-center text-red-500 py-4">{imageError}</div>
        )}
        {processedAnnotation && photoUrl && (
          <AnnotationImage 
            annotation={processedAnnotation}
            photoUrl={photoUrl}
            onLoadingChange={setIsImageLoading}
            onError={setImageError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
