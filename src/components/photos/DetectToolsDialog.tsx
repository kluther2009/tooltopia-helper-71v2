
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PhotoGrid } from "./PhotoGrid"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { DetectedToolsViewer } from "./DetectedToolsViewer"
import { toast } from "sonner"
import { LocationPhoto } from "@/types/photos"
import { useInitialInventoryPhotos } from "@/hooks/useInitialInventoryPhotos"
import { CoordinateSystem } from "@/hooks/useToolCoordinates"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface DetectToolsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function DetectToolsDialog({ isOpen, onClose }: DetectToolsDialogProps) {
  const { photos } = useInitialInventoryPhotos()
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)
  const [detectedTools, setDetectedTools] = useState<any[]>([])
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystem | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const isMobile = useIsMobile()

  const ensureUniqueToolNames = (tools: any[]): any[] => {
    const nameCount: Record<string, number> = {};
    
    return tools.map(tool => {
      const baseName = tool.label;
      
      nameCount[baseName] = (nameCount[baseName] || 0) + 1;
      
      if (nameCount[baseName] === 1) {
        return tool;
      }
      
      const uniqueName = `${baseName} (${nameCount[baseName]})`;
      return { ...tool, label: uniqueName };
    });
  };

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
      setSelectedPhotoId(photo.id) // Store the photo ID for location information

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
        const uniqueNamedTools = ensureUniqueToolNames(data.tools);
        setDetectedTools(uniqueNamedTools)
        
        const defaultCoordinateSystem: CoordinateSystem = {
          origin: 'top-left' as const,
          x_axis_direction: 'left-to-right' as const,
          y_axis_direction: 'top-to-bottom' as const
        };
        
        const responseCoordinateSystem = data.coordinate_system || defaultCoordinateSystem;
        
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

  const validateOrigin = (origin: any): 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' => {
    const validOrigins = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
    return validOrigins.includes(origin as any) ? origin as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' : 'top-left';
  }
  
  const validateXAxisDirection = (direction: any): 'left-to-right' | 'right-to-left' => {
    const validDirections = ['left-to-right', 'right-to-left'] as const;
    return validDirections.includes(direction as any) ? direction as 'left-to-right' | 'right-to-left' : 'left-to-right';
  }
  
  const validateYAxisDirection = (direction: any): 'top-to-bottom' | 'bottom-to-top' => {
    const validDirections = ['top-to-bottom', 'bottom-to-top'] as const;
    return validDirections.includes(direction as any) ? direction as 'top-to-bottom' | 'bottom-to-top' : 'top-to-bottom';
  }

  const handleToolsConfirmed = async (tools: any[]) => {
    try {
      console.log('Saving detected tools:', tools)
      console.log('With coordinate system:', coordinateSystem)
      toast.success('Tool detection data saved')
      resetDetectionState()
      onClose()
    } catch (error) {
      console.error('Error saving tool data:', error)
      toast.error('Failed to save tool data')
    }
  }

  const handleDialogClose = () => {
    resetDetectionState()
    onClose()
  }

  const resetDetectionState = () => {
    setSelectedPhotoUrl(null)
    setSelectedPhotoId(null)
    setDetectedTools([])
    setCoordinateSystem(null)
    setShowConfirmation(false)
    setIsDetecting(false)
  }

  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={handleDialogClose}>
          <SheetContent className="h-[90vh] pt-10">
            <DialogHeader>
              <DialogTitle>Detect Tools in Photos</DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              <PhotoGrid 
                photos={photos}
                onPhotoClick={handlePhotoSelect}
                onDeleteClick={undefined}
                disabled={isDetecting}
              />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
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
      )}

      {selectedPhotoUrl && (
        <DetectedToolsViewer
          imageUrl={selectedPhotoUrl}
          detectedTools={detectedTools}
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false)
          }}
          onConfirm={handleToolsConfirmed}
          photoId={selectedPhotoId}
        />
      )}
    </>
  )
}
