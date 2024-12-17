import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export function usePhotoLocation(photoId: string, isDialogOpen: boolean) {
  const [photoLocation, setPhotoLocation] = useState("")

  useEffect(() => {
    const fetchPhotoLocation = async () => {
      if (!isDialogOpen) return

      try {
        const { data, error } = await supabase
          .from('location_photos')
          .select('location, sub_location')
          .eq('id', photoId)
          .single()

        if (error) throw error
        
        const fullLocation = data.sub_location 
          ? `${data.location} > ${data.sub_location}`
          : data.location

        setPhotoLocation(fullLocation)
      } catch (error) {
        console.error('Error fetching photo location:', error)
        toast.error('Failed to fetch photo location')
      }
    }

    fetchPhotoLocation()
  }, [isDialogOpen, photoId])

  return photoLocation
}