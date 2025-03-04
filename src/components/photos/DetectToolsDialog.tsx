
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PhotoGrid } from "./PhotoGrid"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { DetectedToolsViewer } from "./DetectedToolsViewer"
import { toast } from "sonner"
import { LocationPhoto } from "@/types/photos"
import { useInitialInventoryPhotos } from "@/hooks/useInitialInventoryPhotos"

interface DetectToolsDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface CoordinateSystem {
  origin: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  x_axis_direction: 'left-to-right' | 'right-to-left';
  y_axis_direction: 'top-to-bottom' | 'bottom-to-top';
}

export function DetectToolsDialog({ isOpen, onClose }: DetectToolsDialogProps) {
  const { photos } = useInitialInventoryPhotos()
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
  const [detectedTools, setDetectedTools] = useState<any[]>([])
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystem>({
    origin: 'top-left',
    x_axis_direction: 'left-to-right',
    y_axis_direction: 'top-to-bottom'
  })
  const [isDetecting, setIsDetecting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  console.log('DetectToolsDialog render - isOpen:', isOpen);
  console.log('Current photos count:', photos?.length || 0);
  
  const handlePhotoSelect = async (photo: LocationPhoto) => {
    console.log('===== PHOTO SELECTED =====');
    console.log('Selected photo:', photo);
    setIsDetecting(true)
    
    try {
      // Get a signed URL for the photo that expires in 5 minutes
      console.log('Getting signed URL for photo...');
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

      console.log('Calling detect-tools edge function...');
      const { data, error } = await supabase.functions.invoke('detect-tools', {
        body: { imageUrl: photoUrl }
      })

      if (error) {
        console.error('Error detecting tools:', error)
        toast.error('Failed to detect tools')
        return
      }

      console.log('===== API RESPONSE =====');
      console.log('Full API Response:', data);

      if (data.tools && data.tools.length > 0) {
        console.log(`Successfully detected ${data.tools.length} tools`);
        setDetectedTools(data.tools)
        if (data.coordinate_system) {
          console.log('Using coordinate system from API:', data.coordinate_system);
          setCoordinateSystem(data.coordinate_system)
        } else {
          // Use default coordinate system if not provided
          console.log('No coordinate system provided by API, using default');
          setCoordinateSystem({
            origin: 'top-left',
            x_axis_direction: 'left-to-right',
            y_axis_direction: 'top-to-bottom'
          })
        }
        setShowConfirmation(true)
      } else {
        console.log('No tools detected in the image');
        toast.info('No tools detected in the image')
      }
    } catch (error) {
      console.error('Error in detectTools:', error)
      toast.error('Failed to process image')
    } finally {
      setIsDetecting(false)
    }
  }

  const handleToolsConfirmed = async (tools: any[]) => {
    try {
      // Here you would save the detected tools data to your database
      console.log('===== TOOLS CONFIRMED =====');
      console.log('Saving detected tools:', tools);
      console.log('With coordinate system:', coordinateSystem);
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
          coordinateSystem={coordinateSystem}
        />
      )}
    </>
  )
}
