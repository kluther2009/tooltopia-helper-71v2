
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
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

  useEffect(() => {
    const img = document.getElementById("detected-image") as HTMLImageElement;
    if (img && img.complete) {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setDisplayDimensions({ width: img.clientWidth, height: img.clientHeight });
      setLoading(false);
    }
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight
    const displayWidth = img.width
    const displayHeight = img.height
    
    setImageDimensions({
      width: naturalWidth,
      height: naturalHeight
    })
    setDisplayDimensions({
      width: displayWidth,
      height: displayHeight
    })
    setLoading(false)

    // Enhanced debugging information
    console.log('Image dimensions:', {
      natural: { width: naturalWidth, height: naturalHeight },
      display: { width: displayWidth, height: displayHeight },
      scaleFactor: { 
        x: displayWidth / naturalWidth, 
        y: displayHeight / naturalHeight 
      }
    })
    
    // Log the image size passed to the API (same as natural size)
    console.log('Image size passed to API:', { width: naturalWidth, height: naturalHeight })
    
    // Log normalization factors (converting actual pixels to 0-1000 scale)
    console.log('Normalization factors:', {
      x: 1000 / naturalWidth,
      y: 1000 / naturalHeight
    })
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
                id="detected-image"
                src={imageUrl}
                alt="Tool detection"
                className="max-w-full h-auto rounded-lg shadow-sm"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {!loading && detectedTools.map((tool, index) => {
                // Extract coordinates according to Gemini's format: [y_min, x_min, y_max, x_max]
                const [yMin, xMin, yMax, xMax] = tool.box_2d;
                
                // Convert to CSS format
                const convertedBoundingBox = {
                  left: xMin / 10,     // Convert from 0-1000 to 0-100%
                  top: yMin / 10,      // Convert from 0-1000 to 0-100%
                  width: (xMax - xMin) / 10,
                  height: (yMax - yMin) / 10
                };
                
                // Log raw coordinates from API
                console.log(`Raw coordinates for ${tool.label}:`, {
                  format: 'Gemini [y_min, x_min, y_max, x_max]',
                  values: tool.box_2d,
                  normalizedScale: '0-1000'
                });
                
                // Log percentage-based coordinates
                console.log(`Percentage coordinates for ${tool.label}:`, {
                  ...convertedBoundingBox,
                  unit: '%'
                });
                
                // Create style for the bounding box using the converted format
                const boxStyle = {
                  left: `${convertedBoundingBox.left}%`,
                  top: `${convertedBoundingBox.top}%`,
                  width: `${convertedBoundingBox.width}%`,
                  height: `${convertedBoundingBox.height}%`
                };
                
                return (
                  <div key={index}>
                    <div 
                      className="absolute border-2 border-green-500"
                      style={boxStyle}
                    />
                    <div 
                      className="absolute px-2 py-1 text-xs text-white bg-black/70 rounded"
                      style={{
                        left: `${convertedBoundingBox.left}%`,
                        top: `${Math.max(0, convertedBoundingBox.top - 3)}%`,
                        transform: 'translateY(-100%)'
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
