
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DetectedToolsImage } from "./detected-tools/DetectedToolsImage"
import { getImageOrientation } from "./detected-tools/coordinateUtils"
import { CoordinateSystem, Tool, ImageDimensions } from "./detected-tools/types"

interface DetectedToolsViewerProps {
  imageUrl: string
  detectedTools: Tool[]
  isOpen: boolean
  onClose: () => void
  onConfirm: (tools: Tool[]) => void
  coordinateSystem?: CoordinateSystem
}

export function DetectedToolsViewer({ 
  imageUrl, 
  detectedTools, 
  isOpen, 
  onClose,
  onConfirm,
  coordinateSystem = {
    origin: 'top-left',
    x_axis_direction: 'left-to-right',
    y_axis_direction: 'top-to-bottom'
  }
}: DetectedToolsViewerProps) {
  const [loading, setLoading] = useState(true)
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 })

  // Debug info for the component lifecycle
  console.log('===== DETECTED TOOLS VIEWER RENDER =====');
  console.log('Props received:', {
    toolCount: detectedTools.length,
    isOpen,
    coordinateSystem,
    imageUrlProvided: !!imageUrl
  });
  
  console.log('Current coordinate system:', coordinateSystem);
  console.log('Detected tools:', detectedTools);

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
            Detected Tools ({getImageOrientation(imageDimensions)} Photo)
          </DialogTitle>
        </DialogHeader>
        
        <div className="w-full flex flex-col items-center p-2">
          <ScrollArea className="w-full rounded-md" style={{ 
            maxHeight: 'calc(80vh - 100px)',
            maxWidth: '100%'
          }}>
            <DetectedToolsImage
              imageUrl={imageUrl}
              detectedTools={detectedTools}
              coordinateSystem={coordinateSystem}
            />
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>
            Confirm Detections
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
