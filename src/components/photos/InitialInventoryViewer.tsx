import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { LocationPhoto } from "@/types/photos"
import { PhotoCard } from "./PhotoCard"
import { PhotoAnnotationViewer } from "./PhotoAnnotationViewer"
import { toast } from "sonner"

export function InitialInventoryViewer() {
  const [photos, setPhotos] = useState<LocationPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<LocationPhoto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('location_photos')
        .select('*')
        .eq('is_initial_inventory', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (error) {
      console.error('Error fetching photos:', error)
      toast.error('Failed to load photos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePhoto = async (photo: LocationPhoto) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('location-photos')
        .remove([photo.file_path])

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('location_photos')
        .delete()
        .eq('id', photo.id)

      if (dbError) throw dbError

      setPhotos(photos.filter(p => p.id !== photo.id))
      toast.success('Photo deleted successfully')
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('Failed to delete photo')
    }
  }

  // Group photos by location
  const groupedPhotos = photos.reduce((acc, photo) => {
    const location = photo.location
    if (!acc[location]) {
      acc[location] = []
    }
    acc[location].push(photo)
    return acc
  }, {} as Record<string, LocationPhoto[]>)

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedPhotos).map(([location, locationPhotos]) => (
        <Card key={location} className="p-6">
          <h2 className="text-xl font-semibold mb-4">{location}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onPhotoClick={(p) => setSelectedPhoto(p)}
                onDeleteClick={handleDeletePhoto}
              />
            ))}
          </div>
        </Card>
      ))}
      
      {photos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No photos uploaded yet.
        </div>
      )}

      <PhotoAnnotationViewer
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  )
}