import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

export function useBackgroundPhoto() {
  const [backgroundPhotoUrl, setBackgroundPhotoUrl] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/add-tool') {
      localStorage.removeItem('pendingAnnotation')
      setBackgroundPhotoUrl(null)
    }
  }, [location.pathname])

  useEffect(() => {
    const annotationData = localStorage.getItem('pendingAnnotation')
    if (annotationData) {
      try {
        const data = JSON.parse(annotationData)
        if (data.photoId) {
          fetchPhotoUrl(data.photoId)
        }
      } catch (error) {
        console.error('Error parsing annotation data:', error)
        localStorage.removeItem('pendingAnnotation')
      }
    }
  }, [])

  const fetchPhotoUrl = async (photoId: string) => {
    try {
      const { data: photo } = await supabase
        .from('location_photos')
        .select('file_path')
        .eq('id', photoId)
        .single()

      if (photo) {
        const url = supabase.storage
          .from('location-photos')
          .getPublicUrl(photo.file_path).data.publicUrl
        setBackgroundPhotoUrl(url)
      }
    } catch (error) {
      console.error('Error fetching photo:', error)
    }
  }

  return { backgroundPhotoUrl }
}