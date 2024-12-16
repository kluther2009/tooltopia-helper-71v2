import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LocationPhoto } from "@/types/photos"
import { supabase } from "@/integrations/supabase/client"
import { AnnotationCanvas } from "./canvas/AnnotationCanvas"

interface PhotoAnnotationViewerProps {
  photo: LocationPhoto | null
  isOpen: boolean
  onClose: () => void
}

export function PhotoAnnotationViewer({ photo, isOpen, onClose }: PhotoAnnotationViewerProps) {
  if (!photo || !isOpen) return null

  const handleRectangleDrawn = (coordinates: { x: number; y: number; width: number; height: number }) => {
    console.log('Rectangle drawn:', coordinates)
    // We'll implement tool selection here in the next step
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
        <div className="relative w-full h-[80vh]">
          <AnnotationCanvas
            imageUrl={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
            onRectangleDrawn={handleRectangleDrawn}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}