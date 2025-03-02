import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PhotoGrid } from "./PhotoGrid"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { DetectedToolsViewer } from "./DetectedToolsViewer"
import { toast } from "sonner"
import { LocationPhoto } from "@/types/photos"
import { useInitialInventoryPhotos } from "@/hooks/useInitialInventoryPhotos"
import { fixImageOrientation, dataUrlToBase64 } from "@/utils/imageProcessing"

interface DetectToolsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function DetectToolsDialog({ isOpen, onClose }: DetectToolsDialogProps) {
  const { photos } = useInitialInventoryPhotos()
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
  const [detectedTools, setDetectedTools] = useState<any[]>([])
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
      
      // Store the original photo URL for display
      setSelectedPhotoUrl(photoUrl)

      // Process the image to fix orientation before sending to Gemini API
      // We only need to do this client-side processing for the API, not for the viewer
      // This is because we'll use consistent coordinate transformation for display
      /*
      console.log('Processing image orientation...')
      const processedImageUrl = await fixImageOrientation(photoUrl)
      console.log('Image processed for API')
      
      // Extract base64 data if using processed image
      const base64Data = dataUrlToBase64(processedImageUrl)
      
      // Call the API with the processed image
      const { data, error } = await supabase.functions.invoke('detect-tools', {
        body: { 
          imageUrl: photoUrl,
          processedImage: base64Data // Send processed image if available
        }
      })
      */
      
      // For now, we'll continue using the original URL until backend supports processed images
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

  const handleToolsConfirmed = async (tools: any[]) => {
    try {
      // Here you would save the detected tools data to your database
      console.log('Saving detected tools:', tools)
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
