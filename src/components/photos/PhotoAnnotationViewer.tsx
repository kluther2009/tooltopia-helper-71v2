
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LocationPhoto } from "@/types/photos"
import { supabase } from "@/integrations/supabase/client"
import { AnnotationCanvas } from "./canvas/AnnotationCanvas"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Annotation } from "./canvas/types"
import { toast } from "sonner"
import { usePhotoLocation } from "@/hooks/usePhotoLocation"
import { Button } from "@/components/ui/button"
import { Wand } from "lucide-react"
import { DetectedToolsViewer } from "./DetectedToolsViewer"

interface PhotoAnnotationViewerProps {
  photo: LocationPhoto | null
  isOpen: boolean
  onClose: () => void
}

interface CoordinateData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function PhotoAnnotationViewer({ photo, isOpen, onClose }: PhotoAnnotationViewerProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedTools, setDetectedTools] = useState<any[]>([])
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
  const [showDetectedToolsViewer, setShowDetectedToolsViewer] = useState(false)
  const [coordinateSystem, setCoordinateSystem] = useState<any>(null)
  const navigate = useNavigate()
  const photoLocation = usePhotoLocation(photo?.id || '', isOpen)

  useEffect(() => {
    if (photo?.id && isOpen) {
      fetchAnnotations()
      const url = supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl
      setSelectedPhotoUrl(url)
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
          moved,
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
        const transformedAnnotations = data.map(item => {
          let coordinates: CoordinateData
          
          // Handle coordinates parsing from Json type
          if (typeof item.coordinates === 'string') {
            try {
              coordinates = JSON.parse(item.coordinates) as CoordinateData
            } catch (e) {
              console.error('Failed to parse coordinates string:', item.coordinates)
              coordinates = { x: 0, y: 0, width: 0, height: 0 }
            }
          } else if (item.coordinates && typeof item.coordinates === 'object') {
            const coords = item.coordinates as any
            coordinates = {
              x: typeof coords.x === 'number' ? coords.x : 0,
              y: typeof coords.y === 'number' ? coords.y : 0,
              width: typeof coords.width === 'number' ? coords.width : 0,
              height: typeof coords.height === 'number' ? coords.height : 0
            }
          } else {
            coordinates = { x: 0, y: 0, width: 0, height: 0 }
          }
          
          // Normalize coordinates to ensure they're in 0-1 range
          if (coordinates.x > 1 || coordinates.y > 1 || coordinates.width > 1 || coordinates.height > 1) {
            coordinates = {
              x: coordinates.x / 1000,
              y: coordinates.y / 1000,
              width: coordinates.width / 1000,
              height: coordinates.height / 1000
            }
          }
          
          return {
            id: item.id,
            coordinates,
            tool_id: item.tool_id,
            tool: item.tool,
            moved: item.moved
          } as Annotation
        })
        
        console.log('Transformed annotations:', transformedAnnotations)
        setAnnotations(transformedAnnotations)
      }
    } catch (error) {
      console.error('Error in fetchAnnotations:', error)
    }
  }

  const handleDetectTools = async () => {
    if (!photo || !selectedPhotoUrl) {
      toast.error('No photo selected')
      return
    }

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

      const { data, error } = await supabase.functions.invoke('detect-tools', {
        body: { imageUrl: photoUrl }
      })

      if (error) {
        console.error('Error detecting tools:', error)
        toast.error('Failed to detect tools')
        return
      }

      if (data.tools && data.tools.length > 0) {
        setDetectedTools(data.tools)
        setCoordinateSystem(data.coordinate_system)
        setShowDetectedToolsViewer(true)
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
      if (photo) {
        toast.success(`Saving ${tools.length} detected tools`)
        for (const tool of tools) {
          await saveToolAnnotation(tool, photo)
        }
        toast.success('All tool annotations saved successfully')
        fetchAnnotations()
      }
    } catch (error) {
      console.error('Error saving tool data:', error)
      toast.error('Failed to save tool data')
    }
    setShowDetectedToolsViewer(false)
  }

  const saveToolAnnotation = async (tool: any, photo: LocationPhoto) => {
    try {
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
      
      // AI returns [y_min, x_min, y_max, x_max] in 0-1000 range
      // But for display, we need to match how DetectedToolsViewer processes coordinates
      const [yMin, xMin, yMax, xMax] = tool.box_2d;
      
      // Convert to our coordinate system for storage (normalized 0-1)
      // This should match exactly how DetectedToolsViewer displays them
      const coordinates = {
        x: xMin / 1000,        // left position
        y: yMin / 1000,        // top position  
        width: (xMax - xMin) / 1000,   // width
        height: (yMax - yMin) / 1000   // height
      };
      
      console.log(`Saving annotation coordinates:`, {
        tool: tool.label,
        originalBox: tool.box_2d,
        aiFormat: '[y_min, x_min, y_max, x_max] (0-1000)',
        storedCoords: coordinates,
        note: 'Should match DetectedToolsViewer display'
      });
      
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
      console.error(`Error saving tool annotation for ${tool.label}:`, error)
      throw error
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
        console.error('Error saving temporary annotation:', tempError)
        toast.error('Failed to save annotation')
        return
      }

      console.log('Temporary annotation saved:', tempAnnotation)
      
      // Close the dialog before navigating
      onClose()
      
      // Navigate to add tool page
      navigate('/add-tool')
    } catch (error) {
      console.error('Error in handleRectangleDrawn:', error)
      toast.error('Failed to save annotation')
    }
  }

  if (!photo || !isOpen) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) onClose()
      }}>
        <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 flex flex-row justify-between items-center">
            <DialogTitle>Photo Annotations: {photoLocation}</DialogTitle>
            <Button
              onClick={handleDetectTools}
              disabled={isDetecting}
              variant="outline"
              size="sm"
            >
              <Wand className="h-4 w-4 mr-2" />
              {isDetecting ? 'Detecting...' : 'Detect Tools'}
            </Button>
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

      {selectedPhotoUrl && (
        <DetectedToolsViewer
          imageUrl={selectedPhotoUrl}
          detectedTools={detectedTools}
          isOpen={showDetectedToolsViewer}
          onClose={() => setShowDetectedToolsViewer(false)}
          onConfirm={handleToolsConfirmed}
          coordinateSystem={coordinateSystem}
        />
      )}
    </>
  )
}
