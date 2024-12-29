import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LocationPhoto } from "@/types/photos"
import { supabase } from "@/integrations/supabase/client"
import { AnnotationCanvas } from "./canvas/AnnotationCanvas"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Annotation } from "./canvas/types"

interface PhotoAnnotationViewerProps {
  photo: LocationPhoto | null
  isOpen: boolean
  onClose: () => void
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
        console.log('Raw annotation data:', data)
        const transformedAnnotations = data.map(item => ({
          id: item.id,
          coordinates: typeof item.coordinates === 'string' 
            ? JSON.parse(item.coordinates) 
            : item.coordinates,
          tool_id: item.tool_id,
          tool: item.tool
        }))
        
        console.log('Transformed annotations:', transformedAnnotations)
        setAnnotations(transformedAnnotations)
      }
    } catch (error) {
      console.error('Error in fetchAnnotations:', error)
    }
  }

  const handleRectangleDrawn = (coordinates: { x: number; y: number; width: number; height: number }) => {
    console.log('=== Starting annotation process ===')
    console.log('Rectangle drawn with coordinates:', coordinates)
    console.log('Current photo:', photo)
    
    if (!photo) {
      console.error('No photo selected for annotation')
      return
    }

    // Ensure coordinates are numbers and create a clean object
    const formattedCoordinates = {
      x: Number(coordinates.x),
      y: Number(coordinates.y),
      width: Number(coordinates.width),
      height: Number(coordinates.height)
    }

    console.log('Formatted coordinates:', formattedCoordinates)

    const annotationData = {
      photoId: photo.id,
      coordinates: formattedCoordinates,
      location: photo.location,
      subLocation: photo.sub_location
    }
    
    console.log('Saving annotation data to localStorage:', annotationData)
    localStorage.setItem('pendingAnnotation', JSON.stringify(annotationData))
    
    // Close the dialog before navigating
    onClose()
    
    // Use state parameter in navigation to preserve data
    console.log('Navigating to add-tool route with annotation data...')
    navigate('/add-tool', { 
      state: { 
        pendingAnnotation: annotationData 
      }
    })
  }

  if (!photo || !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader>
          <DialogTitle>Photo Annotations</DialogTitle>
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