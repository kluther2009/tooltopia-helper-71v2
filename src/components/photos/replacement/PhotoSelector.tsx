
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { LocationPhoto } from "@/types/photos"
import { PhotoGrid } from "../PhotoGrid"
import { toast } from "sonner"

interface PhotoSelectorProps {
  title: string
  onPhotoSelect: (photo: LocationPhoto) => void
  excludePhotoId?: string
}

export function PhotoSelector({ title, onPhotoSelect, excludePhotoId }: PhotoSelectorProps) {
  const [photos, setPhotos] = useState<LocationPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPhotos()
  }, [excludePhotoId])

  const fetchPhotos = async () => {
    try {
      let query = supabase
        .from('location_photos')
        .select('*')
        .eq('is_initial_inventory', true)
        .order('created_at', { ascending: false })

      if (excludePhotoId) {
        query = query.neq('id', excludePhotoId)
      }

      const { data, error } = await query

      if (error) throw error
      setPhotos(data || [])
    } catch (error) {
      console.error('Error fetching photos:', error)
      toast.error('Failed to load photos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <PhotoGrid
        photos={photos}
        onPhotoClick={onPhotoSelect}
        onDeleteClick={() => {}} // Required prop but not used in this context
      />
    </div>
  )
}
