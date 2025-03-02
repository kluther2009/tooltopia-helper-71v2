import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { transformBoundingBox } from "@/utils/imageProcessing"

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
  const imageRef = useRef<HTMLImageElement>(null)

  // Update dimensions when window is resized
  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current) {
        const img = imageRef.current
        setDisplayDimensions({
          width: img.clientWidth,
          height: img.clientHeight
        })
      }
    }
    
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight
    const displayWidth = img.clientWidth
    const displayHeight = img.clientHeight
    
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
      aspectRatio: naturalWidth / naturalHeight
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
                ref={imageRef}
                src={imageUrl}
                alt="Tool detection"
                className="max-w-full h-auto rounded-lg shadow-sm"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {!loading && detectedTools.map((tool, index) => {
                // Use the utility function to transform bounding box coordinates consistently
                // This now assumes Gemini always returns [y_min, x_min, y_max, x_max] format
                const boxStyle = transformBoundingBox(
                  tool.box_2d,
                  displayDimensions.width,
                  displayDimensions.height
                );
                
                // Log both the original coordinates and the transformed box for debugging
                console.log(`Bounding box for ${tool.label}:`, {
                  original: tool.box_2d,
                  transformed: boxStyle
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
                        left: boxStyle.left,
                        top: `calc(${boxStyle.top} - 20px)`,
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
