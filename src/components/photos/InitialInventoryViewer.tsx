import { PhotoAnnotationViewer } from "./PhotoAnnotationViewer"
import { PhotoLocationGroup } from "./PhotoLocationGroup"
import { useInitialInventoryPhotos } from "@/hooks/useInitialInventoryPhotos"
import { LocationPhoto } from "@/types/photos"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

export function InitialInventoryViewer() {
  const { photos, isLoading, handleDeletePhoto } = useInitialInventoryPhotos()
  const [selectedPhoto, setSelectedPhoto] = useState<LocationPhoto | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        console.error("Session error:", error)
        navigate("/login")
        return
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
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

  return (
    <div className="space-y-8">
      {Object.entries(groupedPhotos).map(([location, locationPhotos]) => (
        <PhotoLocationGroup
          key={location}
          location={location}
          photos={locationPhotos}
          onPhotoClick={(p) => setSelectedPhoto(p)}
          onDeleteClick={handleDeletePhoto}
        />
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