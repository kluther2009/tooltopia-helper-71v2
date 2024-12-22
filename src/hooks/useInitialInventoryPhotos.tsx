import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { LocationPhoto } from "@/types/photos"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function useInitialInventoryPhotos() {
  const [photos, setPhotos] = useState<LocationPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const fetchPhotos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate("/login")
        return
      }

      const { data, error } = await supabase
        .from('location_photos')
        .select('*')
        .eq('is_initial_inventory', true)
        .order('created_at', { ascending: false })

      if (error) {
        if (error.message.includes('JWT')) {
          navigate("/login")
          return
        }
        throw error
      }
      
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate("/login")
        return
      }

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

  useEffect(() => {
    fetchPhotos()
  }, [])

  return {
    photos,
    isLoading,
    handleDeletePhoto,
    fetchPhotos
  }
}