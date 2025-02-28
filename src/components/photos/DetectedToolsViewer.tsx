
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
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
  const imgRef = useRef<HTMLImageElement>(null)
  
  // Add effect to monitor image size changes at runtime
  useEffect(() => {
    if (!imgRef.current || loading) return
    
    const updateDisplaySize = () => {
      if (!imgRef.current) return
      
      const currentWidth = imgRef.current.clientWidth
      const currentHeight = imgRef.current.clientHeight
      
      console.log('Runtime image dimensions check:', {
        client: { width: currentWidth, height: currentHeight },
        calculated: displayDimensions,
        match: currentWidth === displayDimensions.width && currentHeight === displayDimensions.height
      })
      
      // Update display dimensions if they've changed
      if (currentWidth !== displayDimensions.width || currentHeight !== displayDimensions.height) {
        console.log('Display dimensions changed at runtime - updating:', {
          previous: displayDimensions,
          current: { width: currentWidth, height: currentHeight }
        })
        setDisplayDimensions({
          width: currentWidth,
          height: currentHeight
        })
      }
    }
    
    // Check dimensions after mounting and on window resize
    updateDisplaySize()
    
    const resizeObserver = new ResizeObserver(updateDisplaySize)
    if (imgRef.current) {
      resizeObserver.observe(imgRef.current)
    }
    
    window.addEventListener('resize', updateDisplaySize)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateDisplaySize)
    }
  }, [loading, displayDimensions])

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
      clientSize: { width: img.clientWidth, height: img.clientHeight },
      scaleFactor: { 
        x: displayWidth / naturalWidth, 
        y: displayHeight / naturalHeight 
      }
    })
    
    // Log the image size passed to the API (same as natural size)
    console.log('Image size passed to API:', { width: naturalWidth, height: naturalHeight })
    
    // Log normalization factor (converting actual pixels to 0-1000 scale)
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
                ref={imgRef}
                src={imageUrl}
                alt="Tool detection"
                className="max-w-full h-auto rounded-lg shadow-sm"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {/* Debugging overlay to show image dimensions */}
              {!loading && (
                <div className="absolute top-0 left-0 bg-black/70 text-white px-2 py-1 text-xs z-10">
                  {displayDimensions.width} × {displayDimensions.height} px
                </div>
              )}
              
              {!loading && detectedTools.map((tool, index) => {
                // Extract coordinates according to Gemini's format:
                // [y_min, x_min, y_max, x_max] on a 0-1000 scale
                const [yMin, xMin, yMax, xMax] = tool.box_2d;
                
                // Log raw coordinates from API
                console.log(`Raw coordinates for ${tool.label}:`, {
                  format: 'Gemini [y_min, x_min, y_max, x_max]',
                  values: tool.box_2d,
                  normalizedScale: '0-1000'
                });
                
                // Convert from normalized 0-1000 coordinates to actual image dimensions
                const imageXMin = (xMin / 1000) * imageDimensions.width;
                const imageYMin = (yMin / 1000) * imageDimensions.height;
                const imageXMax = (xMax / 1000) * imageDimensions.width;
                const imageYMax = (yMax / 1000) * imageDimensions.height;
                
                // Calculate the width and height of the box in image dimensions
                const boxWidth = imageXMax - imageXMin;
                const boxHeight = imageYMax - imageYMin;
                
                // Log conversion to actual image pixel coordinates
                console.log(`Image pixel coordinates for ${tool.label}:`, {
                  xMin: imageXMin,
                  yMin: imageYMin,
                  xMax: imageXMax,
                  yMax: imageYMax,
                  width: boxWidth,
                  height: boxHeight
                });
                
                // Scale to display dimensions
                const scaleX = displayDimensions.width / imageDimensions.width;
                const scaleY = displayDimensions.height / imageDimensions.height;
                
                // Calculate final display coordinates and dimensions
                const displayXMin = imageXMin * scaleX;
                const displayYMin = imageYMin * scaleY;
                const displayWidth = boxWidth * scaleX;
                const displayHeight = boxHeight * scaleY;
                
                // Log scaling to display dimensions
                console.log(`Display coordinates for ${tool.label}:`, {
                  scaleFactors: { x: scaleX, y: scaleY },
                  xMin: displayXMin,
                  yMin: displayYMin,
                  width: displayWidth,
                  height: displayHeight
                });
                
                // Create style for the bounding box
                const boxStyle = {
                  left: `${displayXMin}px`,
                  top: `${displayYMin}px`,
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                };
                
                // Complete transformation log
                console.log(`Tool ${index} (${tool.label}) - Full transformation:`, {
                  original: tool.box_2d, // [y_min, x_min, y_max, x_max]
                  normalizedToImage: {
                    xMin: imageXMin, 
                    yMin: imageYMin, 
                    xMax: imageXMax, 
                    yMax: imageYMax
                  },
                  imageToDisplay: {
                    x: displayXMin, 
                    y: displayYMin, 
                    width: displayWidth, 
                    height: displayHeight
                  }
                });

                return (
                  <div key={index}>
                    <div 
                      className="absolute border-2 border-green-500"
                      style={boxStyle}
                    >
                      {/* Debug info inside the box */}
                      <div className="absolute bottom-0 right-0 bg-black/70 text-white px-1 text-[8px]">
                        {Math.round(displayWidth)}×{Math.round(displayHeight)}
                      </div>
                    </div>
                    <div 
                      className="absolute px-2 py-1 text-xs text-white bg-black/70 rounded"
                      style={{
                        left: `${displayXMin}px`,
                        top: `${Math.max(0, displayYMin - 24)}px`,
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
