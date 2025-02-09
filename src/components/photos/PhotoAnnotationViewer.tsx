
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LocationPhoto } from "@/types/photos"
import { supabase } from "@/integrations/supabase/client"
import { AnnotationCanvas } from "./canvas/AnnotationCanvas"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Annotation } from "./canvas/types"
import { toast } from "sonner"
import { usePhotoLocation } from "@/hooks/usePhotoLocation"

interface PhotoAnnotationViewerProps {
  photo: LocationPhoto | null
  isOpen: boolean
  onClose: () => void
}

export function PhotoAnnotationViewer({ photo, isOpen, onClose }: PhotoAnnotationViewerProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const navigate = useNavigate()
  const photoLocation = usePhotoLocation(photo?.id || '', isOpen)

  useEffect(() => {
    if (photo?.id && isOpen) {
      fetchAnnotations()
    }
  }, [photo?.id, isOpen])

  const fetchAnnotations = async () => {
    if (!photo?.id) return

    try {
      console.log('[PhotoAnnotationViewer] Fetching annotations for photo:', photo.id)
      const { data, error } = await supabase
        .from('tool_annotations')
        .select(`
          id,
          coordinates,
          tool_id,
          moved,
          tool:tools (
            id,
            name
          )
        `)
        .eq('photo_id', photo.id)

      if (error) {
        console.error('[PhotoAnnotationViewer] Error fetching annotations:', error)
        return
      }

      if (data) {
        console.log('[PhotoAnnotationViewer] Raw annotation data:', data)
        const transformedAnnotations = data.map(item => ({
          id: item.id,
          coordinates: typeof item.coordinates === 'string' 
            ? JSON.parse(item.coordinates) 
            : item.coordinates,
          tool_id: item.tool_id,
          tool: item.tool,
          moved: item.moved
        }))
        
        console.log('[PhotoAnnotationViewer] Transformed annotations:', transformedAnnotations)
        setAnnotations(transformedAnnotations)
      }
    } catch (error) {
      console.error('[PhotoAnnotationViewer] Error in fetchAnnotations:', error)
    }
  }

  const handleRectangleDrawn = async (coordinates: { x: number; y: number; width: number; height: number }) => {
    if (!photo) {
      toast.error('No photo selected for annotation')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to create annotations')
        return
      }

      // Save to temporary_annotations table
      const { data: tempAnnotation, error: tempError } = await supabase
        .from('temporary_annotations')
        .insert({
          photo_id: photo.id,
          coordinates,
          location: photo.location,
          sub_location: photo.sub_location,
          user_id: user.id
        })
        .select()
        .single()

      if (tempError) {
        console.error('[PhotoAnnotationViewer] Error saving temporary annotation:', tempError)
        toast.error('Failed to save annotation')
        return
      }

      console.log('[PhotoAnnotationViewer] Temporary annotation saved:', tempAnnotation)
      
      // Close the dialog before navigating
      onClose()
      
      // Navigate to add tool page
      navigate('/add-tool')
    } catch (error) {
      console.error('[PhotoAnnotationViewer] Error in handleRectangleDrawn:', error)
      toast.error('Failed to save annotation')
    }
  }

  if (!photo || !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader>
          <DialogTitle>Photo Annotations: {photoLocation}</DialogTitle>
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
