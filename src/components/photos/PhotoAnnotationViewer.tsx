import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LocationPhoto } from "@/types/photos"
import { supabase } from "@/integrations/supabase/client"
import { AnnotationCanvas } from "./canvas/AnnotationCanvas"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

interface PhotoAnnotationViewerProps {
  photo: LocationPhoto | null
  isOpen: boolean
  onClose: () => void
}

interface Annotation {
  id: string
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
  tool_id: string
  tool: {
    name: string
  }
}

export function PhotoAnnotationViewer({ photo, isOpen, onClose }: PhotoAnnotationViewerProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (photo?.id && isOpen) {
      fetchAnnotations()
    }
  }, [photo?.id, isOpen])

  const fetchAnnotations = async () => {
    if (!photo?.id) return

    try {
      console.log('Fetching annotations for photo:', photo.id)
      const { data, error } = await supabase
        .from('tool_annotations')
        .select(`
          id,
          coordinates,
          tool_id,
          tool:tools (
            id,
            name
          )
        `)
        .eq('photo_id', photo.id)

      if (error) {
        console.error('Error fetching annotations:', error)
        return
      }

      if (data) {
        console.log('Fetched annotations:', data)
        setAnnotations(data as Annotation[])
      }
    } catch (error) {
      console.error('Error in fetchAnnotations:', error)
    }
  }

  const handleRectangleDrawn = (coordinates: { x: number; y: number; width: number; height: number }) => {
    // Store coordinates in localStorage for the Add Tool page to use
    localStorage.setItem('pendingAnnotation', JSON.stringify({
      photoId: photo?.id,
      coordinates,
      location: photo?.location,
      subLocation: photo?.sub_location
    }))
    
    // Navigate to Add Tool page
    navigate('/add-tool')
  }

  if (!photo || !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader>
          <DialogTitle className="px-4 py-2">Photo Annotations</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[80vh]">
          <AnnotationCanvas
            imageUrl={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
            onRectangleDrawn={handleRectangleDrawn}
            existingAnnotations={annotations}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}