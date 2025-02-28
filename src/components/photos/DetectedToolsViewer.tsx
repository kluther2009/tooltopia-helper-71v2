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
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // IMPORTANT: We now detect which coordinate format to use based on a constant
  // Gemini API documentation states that they use [y_min, x_min, y_max, x_max] format
  // but testing showed that for some images a different format works better
  const USE_YMINXMIN_FORMAT = false // Set to true for [y_min, x_min, y_max, x_max], false for [x_min, y_min, x_max, y_max]

  // Function to update dimensions based on the actual rendered image
  const updateDimensions = () => {
    if (imageRef.current) {
      const img = imageRef.current
      const rect = img.getBoundingClientRect()
      
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
      
      setDisplayDimensions({
        width: rect.width,
        height: rect.height
      })
      
      console.log('Updated dimensions:', {
        natural: { width: img.naturalWidth, height: img.naturalHeight },
        display: { width: rect.width, height: rect.height },
        aspectRatio: img.naturalWidth / img.naturalHeight,
        coordinateFormat: USE_YMINXMIN_FORMAT ? '[y_min, x_min, y_max, x_max]' : '[x_min, y_min, x_max, y_max]'
      })
    }
  }

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      updateDimensions()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Re-measure image after it's loaded to ensure we have accurate dimensions
  useEffect(() => {
    if (!loading && imageRef.current) {
      // Short delay to ensure image is fully rendered
      const timer = setTimeout(() => {
        updateDimensions()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    })
    
    // Use getBoundingClientRect for more accurate display dimensions
    const rect = img.getBoundingClientRect()
    setDisplayDimensions({
      width: rect.width,
      height: rect.height
    })
    
    console.log('Image loaded with dimensions:', {
      natural: { width: img.naturalWidth, height: img.naturalHeight },
      display: { width: rect.width, height: rect.height },
      aspectRatio: img.naturalWidth / img.naturalHeight
    })
    
    setLoading(false)
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

  // Toggle to force reverting to the original coordinate system
  const toggleCoordinateSystem = () => {
    // This function would allow toggling between coordinate systems if needed
    // Not implemented in the UI, but available for debugging
    console.log('Would toggle coordinate system')
  }

  // Log detected tools for debugging
  console.log('All detected tools with format:', 
    USE_YMINXMIN_FORMAT ? '[y_min, x_min, y_max, x_max]' : '[x_min, y_min, x_max, y_max]', 
    detectedTools
  )
  
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
            <div className="relative inline-block" ref={containerRef}>
              <img 
                ref={imageRef}
                src={imageUrl}
                alt="Tool detection"
                className="max-w-full h-auto rounded-lg shadow-sm"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {!loading && detectedTools.map((tool, index) => {
                // Get coordinates based on the format we're using
                let xMin, yMin, xMax, yMax;
                
                if (USE_YMINXMIN_FORMAT) {
                  // Original format: [y_min, x_min, y_max, x_max]
                  [yMin, xMin, yMax, xMax] = tool.box_2d;
                } else {
                  // New format: [x_min, y_min, x_max, y_max]
                  [xMin, yMin, xMax, yMax] = tool.box_2d;
                }
                
                // Convert from 0-1000 scale to 0-1 scale
                const normalizedXMin = xMin / 1000;
                const normalizedYMin = yMin / 1000;
                const normalizedXMax = xMax / 1000;
                const normalizedYMax = yMax / 1000;
                
                // Calculate width and height
                const normalizedWidth = normalizedXMax - normalizedXMin;
                const normalizedHeight = normalizedYMax - normalizedYMin;
                
                // Scale to the displayed image dimensions
                const leftPx = normalizedXMin * displayDimensions.width;
                const topPx = normalizedYMin * displayDimensions.height;
                const widthPx = normalizedWidth * displayDimensions.width;
                const heightPx = normalizedHeight * displayDimensions.height;
                
                // Log coordinates for debugging
                console.log(`Box coordinates for ${tool.label}:`, {
                  format: USE_YMINXMIN_FORMAT ? '[y_min, x_min, y_max, x_max]' : '[x_min, y_min, x_max, y_max]',
                  raw: tool.box_2d,
                  normalized: [normalizedXMin, normalizedYMin, normalizedXMax, normalizedYMax],
                  pixels: { left: leftPx, top: topPx, width: widthPx, height: heightPx }
                });
                
                // Create the style object for positioning
                const boxStyle = {
                  left: `${leftPx}px`,
                  top: `${topPx}px`,
                  width: `${widthPx}px`,
                  height: `${heightPx}px`
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
                        left: `${leftPx}px`,
                        top: `${Math.max(0, topPx - 5)}px`,
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
        
        {/*
        // Uncomment for debugging
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <div>Format: {USE_YMINXMIN_FORMAT ? '[y_min, x_min, y_max, x_max]' : '[x_min, y_min, x_max, y_max]'}</div>
          <div>Image: {imageDimensions.width}×{imageDimensions.height}</div>
          <div>Display: {displayDimensions.width}×{displayDimensions.height}</div>
          <button 
            onClick={toggleCoordinateSystem}
            className="mt-1 px-2 py-1 bg-gray-200 rounded text-xs"
          >
            Toggle Format
          </button>
        </div>
        */}

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