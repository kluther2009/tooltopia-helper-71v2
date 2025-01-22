import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface ProjectPhoto {
  id: string;
  file_path: string;
  created_at: string;
  description: string | null;
}

interface ProjectPhotoViewerDialogProps {
  photo: ProjectPhoto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectPhotoViewerDialog({ photo, isOpen, onClose }: ProjectPhotoViewerDialogProps) {
  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <div className="relative aspect-video">
          <img
            src={`${supabase.storage.from('project-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
            alt="Project photo"
            className="object-contain w-full h-full"
          />
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Added on: {new Date(photo.created_at).toLocaleDateString()}
          </p>
          {photo.description && (
            <p className="mt-2 text-sm">{photo.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}