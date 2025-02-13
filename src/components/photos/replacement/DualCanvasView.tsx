
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { LocationPhoto } from "@/types/photos"
import { AnnotationCanvas } from "../canvas/AnnotationCanvas"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Annotation } from "../canvas/types"

interface DualCanvasViewProps {
  oldPhoto: LocationPhoto
  newPhoto: LocationPhoto
  onClose: () => void
}

export function DualCanvasView({ oldPhoto, newPhoto, onClose }: DualCanvasViewProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedAnnotations, setSelectedAnnotations] = useState<string[]>([])
  const [isTransferring, setIsTransferring] = useState(false)

  useEffect(() => {
    fetchAnnotations()
  }, [oldPhoto.id])

  const fetchAnnotations = async () => {
    try {
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
        .eq('photo_id', oldPhoto.id)

      if (error) throw error
      setAnnotations(data || [])
    } catch (error) {
      console.error('Error fetching annotations:', error)
      toast.error('Failed to load annotations')
    }
  }

  const handleAnnotationSelect = (annotationId: string, isShiftKey: boolean) => {
    if (isShiftKey) {
      setSelectedAnnotations(prev => 
        prev.includes(annotationId)
          ? prev.filter(id => id !== annotationId)
          : [...prev, annotationId]
      )
    } else {
      setSelectedAnnotations([annotationId])
    }
  }

  const handleTransferAnnotations = async (
    newCoordinates: Record<string, { x: number; y: number; width: number; height: number }>
  ) => {
    setIsTransferring(true)
    try {
      const updates = Object.entries(newCoordinates).map(([annotationId, coordinates]) => ({
        photo_id: newPhoto.id,
        coordinates,
        moved: true
      }))

      const { error } = await supabase
        .from('tool_annotations')
        .upsert(
          updates.map((update, index) => ({
            ...update,
            id: selectedAnnotations[index]
          }))
        )

      if (error) throw error
      toast.success('Annotations transferred successfully')
      onClose()
    } catch (error) {
      console.error('Error transferring annotations:', error)
      toast.error('Failed to transfer annotations')
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Transfer Annotations</h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isTransferring}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleTransferAnnotations({})}
            disabled={selectedAnnotations.length === 0 || isTransferring}
          >
            Transfer Selected Annotations
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg overflow-hidden">
          <h3 className="p-2 bg-gray-100 font-medium">Old Photo</h3>
          <AnnotationCanvas
            imageUrl={`${supabase.storage.from('location-photos').getPublicUrl(oldPhoto.file_path).data.publicUrl}`}
            existingAnnotations={annotations}
            onAnnotationSelect={handleAnnotationSelect}
            selectedAnnotations={selectedAnnotations}
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h3 className="p-2 bg-gray-100 font-medium">New Photo</h3>
          <AnnotationCanvas
            imageUrl={`${supabase.storage.from('location-photos').getPublicUrl(newPhoto.file_path).data.publicUrl}`}
            isDropTarget={true}
            onAnnotationDrop={handleTransferAnnotations}
          />
        </div>
      </div>
    </div>
  )
}
