
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Session error:", sessionError)
        navigate("/login")
        return
      }

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
        if (error.message.includes('JWT') || error.message.includes('session')) {
          await supabase.auth.signOut()
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
      // 1. First, clean up any temporary annotation transfers
      const { error: tempCleanupError } = await supabase
        .from('temp_annotation_transfers')
        .delete()
        .eq('new_photo_id', photo.id);

      if (tempCleanupError) {
        console.error('Error cleaning up temporary transfers:', tempCleanupError);
      }

      // 2. Delete the photo record from the database
      const { error: dbError } = await supabase
        .from('location_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      // 3. Delete from storage with retries
      const maxRetries = 3;
      let retryCount = 0;
      let storageError = null;

      while (retryCount < maxRetries) {
        try {
          const { error: deleteError } = await supabase.storage
            .from('location-photos')
            .remove([photo.file_path]);

          if (!deleteError) {
            // Success, exit retry loop
            storageError = null;
            break;
          }

          storageError = deleteError;
          retryCount++;
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        } catch (error) {
          storageError = error;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      if (storageError) {
        console.error('Failed to delete file from storage after retries:', storageError);
        // Continue anyway since the database record is deleted
      }

      setPhotos(photos.filter(p => p.id !== photo.id))
      toast.success('Photo deleted successfully')
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('Failed to delete photo')
    }
  }

  useEffect(() => {
    let mounted = true;

    const loadPhotos = async () => {
      if (mounted) {
        await fetchPhotos()
      }
    }

    loadPhotos()

    return () => {
      mounted = false
    }
  }, [])

  return {
    photos,
    isLoading,
    handleDeletePhoto,
    fetchPhotos
  }
}
