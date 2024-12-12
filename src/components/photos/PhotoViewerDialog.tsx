import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { LocationPhoto } from "@/types/photos"

interface PhotoViewerDialogProps {
  photo: LocationPhoto | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function PhotoViewerDialog({ photo, isOpen, onOpenChange }: PhotoViewerDialogProps) {
  if (!photo) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{photo.location}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video relative rounded-md overflow-hidden">
          <img
            src={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
            alt={photo.location}
            className="object-contain w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}