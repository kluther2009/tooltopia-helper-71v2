
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
  const [selectedPhoto, setSelectedPhoto] = useState<LocationPhoto | null>(null)
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
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
    setSelectedPhoto(photo)
    
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
      console.log('Saving detected tools:', tools);
      
      if (selectedPhoto) {
        toast.success(`Saving ${tools.length} detected tools`);
        
        // Process each tool and save its annotation
        for (const tool of tools) {
          console.log('Processing tool:', tool);
          
          // Format coordinates to match expected format
          if (!tool.box_2d || tool.box_2d.length !== 4) {
            console.error('Invalid bounding box format for tool:', tool);
            continue;
          }
          
          // Create/update tool record and save annotation
          await saveToolAnnotation(tool, selectedPhoto);
        }
        
        toast.success('All tool annotations saved successfully');
      }
      
      resetDetectionState();
      onClose();
    } catch (error) {
      console.error('Error saving tool data:', error);
      toast.error('Failed to save tool data');
    }
  };

  const saveToolAnnotation = async (tool: any, photo: LocationPhoto) => {
    try {
      // First, check if the tool exists or needs to be created
      let toolId: string;
      
      const { data: existingTools, error: toolQueryError } = await supabase
        .from('tools')
        .select('id')
        .eq('name', tool.label)
        .limit(1);
      
      if (toolQueryError) {
        throw toolQueryError;
      }
      
      if (existingTools && existingTools.length > 0) {
        toolId = existingTools[0].id;
        console.log(`Using existing tool: ${tool.label} (${toolId})`);
      } else {
        // Create a new tool record
        const { data: newTool, error: createToolError } = await supabase
          .from('tools')
          .insert({
            name: tool.label,
            status: 'available',
            location: photo.location || 'Unknown'
          })
          .select('id')
          .single();
        
        if (createToolError) {
          throw createToolError;
        }
        
        toolId = newTool.id;
        console.log(`Created new tool: ${tool.label} (${toolId})`);
      }
      
      // Now create the tool annotation
      // Calculate the bounding box coordinates
      const [yMin, xMin, yMax, xMax] = tool.box_2d;
      
      const coordinates = {
        x: xMin,
        y: yMin,
        width: xMax - xMin,
        height: yMax - yMin
      };
      
      console.log(`Saving annotation with coordinates:`, coordinates);
      
      // Insert the annotation
      const { error: annotationError } = await supabase
        .from('tool_annotations')
        .insert({
          tool_id: toolId,
          photo_id: photo.id,
          coordinates
        });
      
      if (annotationError) {
        throw annotationError;
      }
      
      console.log(`Saved annotation for tool: ${tool.label}`);
    } catch (error) {
      console.error(`Error saving tool annotation for ${tool.label}:`, error);
      throw error;
    }
  };

  const handleDialogClose = () => {
    resetDetectionState()
    onClose()
  }

  const resetDetectionState = () => {
    setSelectedPhoto(null)
    setSelectedPhotoUrl(null)
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
          coordinateSystem={coordinateSystem}
        />
      )}
    </>
  )
}
