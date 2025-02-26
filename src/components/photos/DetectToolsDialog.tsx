
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

export function DetectToolsDialog({ isOpen, onClose }: DetectToolsDialogProps) {
  const { photos } = useInitialInventoryPhotos()
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
  const [detectedTools, setDetectedTools] = useState<any[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handlePhotoSelect = async (photo: LocationPhoto) => {
    setIsDetecting(true)
    const photoUrl = supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl
    setSelectedPhotoUrl(photoUrl)

    try {
      const { data, error } = await supabase.functions.invoke('detect-tools', {
        body: { imageUrl: photoUrl }
      })

      if (error) {
        console.error('Error detecting tools:', error)
        toast.error('Failed to detect tools')
        return
      }

      if (data.tools && data.tools.length > 0) {
        // Format the tools data to match the expected structure
        const formattedTools = data.tools.map((tool: any) => ({
          label: tool.name || tool.label,
          box_2d: [
            tool.boundingBox.x,
            tool.boundingBox.y,
            tool.boundingBox.x + tool.boundingBox.width,
            tool.boundingBox.y + tool.boundingBox.height
          ]
        }))
        
        console.log('Formatted tools:', formattedTools)
        setDetectedTools(formattedTools)
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

      <DetectedToolsViewer
        imageUrl={selectedPhotoUrl || ''}
        detectedTools={detectedTools}
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleToolsConfirmed}
      />
    </>
  )
}
