import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LocationPhoto } from "@/types/photos"
import { supabase } from "@/integrations/supabase/client"
import { AnnotationCanvas } from "./canvas/AnnotationCanvas"
import { useState } from "react"
import { ToolSelectionDialog } from "./ToolSelectionDialog"

interface PhotoAnnotationViewerProps {
  photo: LocationPhoto | null
  isOpen: boolean
  onClose: () => void
}

export function PhotoAnnotationViewer({ photo, isOpen, onClose }: PhotoAnnotationViewerProps) {
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  if (!photo || !isOpen) return null

  const handleRectangleDrawn = (coordinates: { x: number; y: number; width: number; height: number }) => {
    setSelectedCoordinates(coordinates)
  }

  return (
    <>
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

      <ToolSelectionDialog
        isOpen={!!selectedCoordinates}
        onClose={() => setSelectedCoordinates(null)}
        onToolSelect={() => {
          setSelectedCoordinates(null)
        }}
        coordinates={selectedCoordinates || { x: 0, y: 0, width: 0, height: 0 }}
        photoId={photo.id}
      />
    </>
  )
}