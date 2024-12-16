import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocationPhoto } from "@/types/photos";
import { supabase } from "@/integrations/supabase/client";

interface PhotoViewerDialogProps {
  photo: LocationPhoto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoViewerDialog({ photo, isOpen, onClose }: PhotoViewerDialogProps) {
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
          <img
            src={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
            alt={photo.location}
            className="object-contain w-full h-full"
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