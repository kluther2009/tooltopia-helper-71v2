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
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session error:", error)
          if (mounted) navigate("/login")
          return
        }

        if (!session) {
          if (mounted) navigate("/login")
          return
        }
      } catch (error) {
        console.error("Session check error:", error)
        if (mounted) navigate("/login")
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && mounted) {
        navigate("/login")
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [navigate])

  // Check for pending annotation data and set selected photo
  useEffect(() => {
    const annotationData = localStorage.getItem('pendingAnnotation')
    if (annotationData) {
      try {
        const data = JSON.parse(annotationData)
        if (data.photoId) {
          const photo = photos.find(p => p.id === data.photoId)
          if (photo) {
            setSelectedPhoto(photo)
          }
        }
      } catch (error) {
        console.error('Error parsing annotation data:', error)
      }
    }
  }, [photos])

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {Object.entries(photos.reduce((acc, photo) => {
        const location = photo.location
        if (!acc[location]) {
          acc[location] = []
        }
        acc[location].push(photo)
        return acc
      }, {} as Record<string, LocationPhoto[]>)).map(([location, locationPhotos]) => (
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