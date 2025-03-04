
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
      // Get a signed URL for the photo that expires in 5 minutes
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
        
        // Ensure coordinate system has the correct type
        const defaultCoordinateSystem: CoordinateSystem = {
          origin: 'top-left' as const,
          x_axis_direction: 'left-to-right' as const,
          y_axis_direction: 'top-to-bottom' as const
        };
        
        // Extract coordinate system from response or use default
        const responseCoordinateSystem = data.coordinate_system || defaultCoordinateSystem;
        
        // Validate the coordinate system with proper type checking
        const validatedCoordinateSystem: CoordinateSystem = {
          origin: validateOrigin(responseCoordinateSystem.origin),
          x_axis_direction: validateXAxisDirection(responseCoordinateSystem.x_axis_direction),
          y_axis_direction: validateYAxisDirection(responseCoordinateSystem.y_axis_direction)
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

  // Helper functions to validate coordinate system values with proper type constraints
  const validateOrigin = (origin: any): 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' => {
    const validOrigins = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
    return validOrigins.includes(origin as any) ? origin as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' : 'top-left';
  }
  
  // Specifically validate X axis direction
  const validateXAxisDirection = (direction: any): 'left-to-right' | 'right-to-left' => {
    const validDirections = ['left-to-right', 'right-to-left'] as const;
    return validDirections.includes(direction as any) ? direction as 'left-to-right' | 'right-to-left' : 'left-to-right';
  }
  
  // Specifically validate Y axis direction
  const validateYAxisDirection = (direction: any): 'top-to-bottom' | 'bottom-to-top' => {
    const validDirections = ['top-to-bottom', 'bottom-to-top'] as const;
    return validDirections.includes(direction as any) ? direction as 'top-to-bottom' | 'bottom-to-top' : 'top-to-bottom';
  }

  const handleToolsConfirmed = async (tools: any[]) => {
    try {
      // Here you would save the detected tools data to your database
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
