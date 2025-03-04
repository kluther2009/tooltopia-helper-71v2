
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useImageDimensions } from "@/hooks/useImageDimensions"
import { useToolCoordinates, CoordinateSystem } from "@/hooks/useToolCoordinates"
import { ToolBoundingBox } from "./ToolBoundingBox"

interface Tool {
  label: string
  box_2d: number[]
}

interface DetectedToolsViewerProps {
  imageUrl: string
  detectedTools: Tool[]
  isOpen: boolean
  onClose: () => void
  onConfirm: (tools: Tool[]) => void
}

export function DetectedToolsViewer({ 
  imageUrl, 
  detectedTools, 
  isOpen, 
  onClose,
  onConfirm 
}: DetectedToolsViewerProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  // Default coordinate system (standard computer vision format)
  const [coordinateSystem] = useState<CoordinateSystem>({
    origin: 'top-left',
    x_axis_direction: 'left-to-right',
    y_axis_direction: 'top-to-bottom'
  })

  const {
    loading,
    error,
    setError,
    imageDimensions,
    displayDimensions,
    orientation,
    handleImageLoad,
    handleImageError
  } = useImageDimensions(imageRef, imageContainerRef)

  const { convertCoordinates } = useToolCoordinates({
    imageDimensions,
    displayDimensions,
    orientation,
    coordinateSystem
  })

  const handleConfirm = () => {
    onConfirm(detectedTools)
    toast.success("Tool detection data saved")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Detected Tools ({orientation?.charAt(0).toUpperCase() + orientation?.slice(1) || 'Loading'} Photo)
          </DialogTitle>
        </DialogHeader>
        
        <div className="w-full flex flex-col items-center p-2">
          {error ? (
            <div className="text-red-500 mb-4">
              <p>{error}</p>
              <p className="text-xs break-all mt-1">URL: {imageUrl}</p>
            </div>
          ) : (
            <ScrollArea className="w-full rounded-md" style={{ 
              maxHeight: 'calc(80vh - 100px)',
              maxWidth: '100%'
            }}>
              <div 
                className="relative w-full flex justify-center" 
                ref={imageContainerRef}
              >
                <div className="relative inline-block">
                  <img 
                    id="detected-image"
                    ref={imageRef}
                    src={imageUrl}
                    alt="Tool detection"
                    className="rounded-lg shadow-sm max-w-full h-auto object-contain"
                    onLoad={handleImageLoad}
                    onError={() => {
                      handleImageError();
                      toast.error('Failed to load image');
                    }}
                  />
                  
                  {!loading && detectedTools.map((tool, index) => {
                    if (!tool.box_2d || tool.box_2d.length !== 4) {
                      console.error('Invalid bounding box format for tool:', tool);
                      return null;
                    }
                    
                    console.log(`Rendering bounding box for ${tool.label}:`, {
                      box2d: tool.box_2d,
                      orientation: orientation,
                      coordinateSystem: coordinateSystem
                    });
                    
                    const coords = convertCoordinates(tool.box_2d);
                    
                    return (
                      <ToolBoundingBox 
                        key={index}
                        label={tool.label}
                        coords={coords}
                      />
                    );
                  })}

                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={loading || !!error}>
            Confirm Detections
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
