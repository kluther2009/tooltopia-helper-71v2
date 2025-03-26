import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LocationPhoto } from "@/types/photos"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PhotoViewerDialog } from "./PhotoViewerDialog"

interface LocationPhotoViewerProps {
  location: string | null
  isOpen: boolean
  onClose: () => void
}

export function LocationPhotoViewer({ location, isOpen, onClose }: LocationPhotoViewerProps) {
  const [photos, setPhotos] = useState<LocationPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<LocationPhoto | null>(null)

  useEffect(() => {
    if (location && isOpen) {
      fetchLocationPhotos()
    }
  }, [location, isOpen])

  const fetchLocationPhotos = async () => {
    if (!location) return

    try {
      const { data, error } = await supabase
        .from('location_photos')
        .select('*')
        .eq('location', location)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (error) {
      console.error('Error fetching photos:', error)
      toast.error('Failed to load photos')
    }
  }

  if (!location || !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Photos for {location}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-video cursor-pointer rounded-lg overflow-hidden"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
                  alt={photo.location}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>

      <PhotoViewerDialog
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </Dialog>
  )
}