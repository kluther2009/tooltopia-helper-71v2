
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 })

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    })
    setDisplayDimensions({
      width: img.width,
      height: img.height
    })
    setLoading(false)

    console.log('Natural dimensions:', { width: img.naturalWidth, height: img.naturalHeight })
    console.log('Display dimensions:', { width: img.width, height: img.height })
  }

  const handleImageError = () => {
    setError('Failed to load image')
    setLoading(false)
    toast.error('Failed to load image')
  }

  const handleConfirm = () => {
    onConfirm(detectedTools)
    toast.success("Tool detection data saved")
    onClose()
  }

  // Log detected tools for debugging
  console.log('All detected tools:', detectedTools)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detected Tools</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full flex flex-col items-center p-4">
          {error ? (
            <div className="text-red-500 mb-4">
              <p>{error}</p>
              <p className="text-xs break-all mt-1">URL: {imageUrl}</p>
            </div>
          ) : (
            <div className="relative inline-block">
              <img 
                src={imageUrl}
                alt="Tool detection"
                className="max-w-full h-auto rounded-lg shadow-sm"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {!loading && detectedTools.map((tool, index) => {
                // Extract coordinates according to Gemini's format:
                // [y_min, x_min, y_max, x_max] on a 0-1000 scale
                const [yMin, xMin, yMax, xMax] = tool.box_2d;
                
                // Convert from normalized 0-1000 coordinates to actual image dimensions
                const imageXMin = (xMin / 1000) * imageDimensions.width;
                const imageYMin = (yMin / 1000) * imageDimensions.height;
                const imageXMax = (xMax / 1000) * imageDimensions.width;
                const imageYMax = (yMax / 1000) * imageDimensions.height;
                
                // Calculate the width and height of the box in image dimensions
                const boxWidth = imageXMax - imageXMin;
                const boxHeight = imageYMax - imageYMin;
                
                // Scale to display dimensions
                const scaleX = displayDimensions.width / imageDimensions.width;
                const scaleY = displayDimensions.height / imageDimensions.height;
                
                // Calculate final display coordinates and dimensions
                const displayXMin = imageXMin * scaleX;
                const displayYMin = imageYMin * scaleY;
                const displayWidth = boxWidth * scaleX;
                const displayHeight = boxHeight * scaleY;
                
                // Create style for the bounding box
                const boxStyle = {
                  left: displayXMin,
                  top: displayYMin,
                  width: displayWidth,
                  height: displayHeight,
                };
                
                // Log the coordinate transformations for debugging
                console.log(`Tool ${index} (${tool.label}):`, {
                  original: tool.box_2d, // [y_min, x_min, y_max, x_max]
                  imageDimensions: {xMin: imageXMin, yMin: imageYMin, xMax: imageXMax, yMax: imageYMax},
                  displayDimensions: {x: displayXMin, y: displayYMin, width: displayWidth, height: displayHeight}
                });

                return (
                  <div key={index}>
                    <div 
                      className="absolute border-2 border-green-500"
                      style={boxStyle}
                    />
                    <div 
                      className="absolute px-2 py-1 text-xs text-white bg-black/70 rounded"
                      style={{
                        left: displayXMin,
                        top: Math.max(0, displayYMin - 24),
                      }}
                    >
                      {tool.label}
                    </div>
                  </div>
                )
              })}

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              )}
            </div>
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
