import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PhotoGrid } from "./PhotoGrid"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { DetectedToolsViewer } from "./DetectedToolsViewer"
import { toast } from "sonner"
import { LocationPhoto } from "@/types/photos"
import { useInitialInventoryPhotos } from "@/hooks/useInitialInventoryPhotos"
import { CoordinateSystem } from "@/hooks/useToolCoordinates"

interface DetectToolsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function DetectToolsDialog({ isOpen, onClose }: DetectToolsDialogProps) {
  const { photos } = useInitialInventoryPhotos()
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
  const [detectedTools, setDetectedTools] = useState<any[]>([])
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystem | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handlePhotoSelect = async (photo: LocationPhoto) => {
    setIsDetecting(true)
    
    try {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('location-photos')
        .createSignedUrl(photo.file_path, 300)

      if (signedUrlError) {
        console.error('Error getting signed URL:', signedUrlError)
        toast.error('Failed to access image')
        return
      }

      const photoUrl = signedUrlData.signedUrl
      console.log('Selected photo URL (signed):', photoUrl)
      setSelectedPhotoUrl(photoUrl)

      const { data, error } = await supabase.functions.invoke('detect-tools', {
        body: { imageUrl: photoUrl }
      })

      if (error) {
        console.error('Error detecting tools:', error)
        toast.error('Failed to detect tools')
        return
      }

      console.log('API Response:', data)

      if (data.tools && data.tools.length > 0) {
        setDetectedTools(data.tools)
        
        const defaultCoordinateSystem: CoordinateSystem = {
          origin: 'top-left',
          x_axis_direction: 'left-to-right',
          y_axis_direction: 'top-to-bottom'
        };
        
        const responseCoordinateSystem = data.coordinate_system || defaultCoordinateSystem;
        
        const validatedCoordinateSystem: CoordinateSystem = {
          origin: validateOrigin(responseCoordinateSystem.origin),
          x_axis_direction: validateAxisDirection(responseCoordinateSystem.x_axis_direction, true),
          y_axis_direction: validateAxisDirection(responseCoordinateSystem.y_axis_direction, false)
        };
        
        setCoordinateSystem(validatedCoordinateSystem)
        setShowConfirmation(true)
      } else {
        toast.info('No tools detected in the image')
      }
    } catch (error) {
      console.error('Error in detectTools:', error)
      toast.error('Failed to process image')
    } finally {
      setIsDetecting(false)
    }
  }

  const validateOrigin = (origin: any): CoordinateSystem['origin'] => {
    const validOrigins: CoordinateSystem['origin'][] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    return validOrigins.includes(origin) ? origin : 'top-left';
  }
  
  const validateAxisDirection = (direction: any, isXAxis: boolean): CoordinateSystem['x_axis_direction'] | CoordinateSystem['y_axis_direction'] => {
    if (isXAxis) {
      const validXDirections: CoordinateSystem['x_axis_direction'][] = ['left-to-right', 'right-to-left'];
      return validXDirections.includes(direction) ? direction as CoordinateSystem['x_axis_direction'] : 'left-to-right';
    } else {
      const validYDirections: CoordinateSystem['y_axis_direction'][] = ['top-to-bottom', 'bottom-to-top'];
      return validYDirections.includes(direction) ? direction as CoordinateSystem['y_axis_direction'] : 'top-to-bottom';
    }
  }

  const handleToolsConfirmed = async (tools: any[]) => {
    try {
      console.log('Saving detected tools:', tools)
      console.log('With coordinate system:', coordinateSystem)
      toast.success('Tool detection data saved')
      setShowConfirmation(false)
      onClose()
    } catch (error) {
      console.error('Error saving tool data:', error)
      toast.error('Failed to save tool data')
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detect Tools in Photos</DialogTitle>
          </DialogHeader>
          <PhotoGrid 
            photos={photos}
            onPhotoClick={handlePhotoSelect}
            onDeleteClick={undefined}
            disabled={isDetecting}
          />
        </DialogContent>
      </Dialog>

      {selectedPhotoUrl && (
        <DetectedToolsViewer
          imageUrl={selectedPhotoUrl}
          detectedTools={detectedTools}
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleToolsConfirmed}
        />
      )}
    </>
  )
}
