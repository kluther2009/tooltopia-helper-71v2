import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { AnnotationImage } from "./AnnotationImage";

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Tool Location</DialogTitle>
        {isImageLoading && (
          <div className="text-center py-4">Loading image...</div>
        )}
        {imageError && (
          <div className="text-center text-red-500 py-4">{imageError}</div>
        )}
        {annotation && (
          <AnnotationImage 
            annotation={annotation}
            onLoadingChange={setIsImageLoading}
            onError={setImageError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}