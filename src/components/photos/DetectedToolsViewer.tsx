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
        aspectRatio: img.naturalWidth / img.naturalHeight
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

  // Function to calculate bounding box positions based on different coordinate systems
  const getBoxPositions = (tool: Tool) => {
    if (displayDimensions.width === 0 || displayDimensions.height === 0) {
      return {
        left: '0px',
        top: '0px',
        width: '0px',
        height: '0px'
      }
    }
    
    const [coord1, coord2, coord3, coord4] = tool.box_2d;
    
    // Try both coordinate systems and use heuristics to determine which is correct
    // For rectangular images, the correct system may differ from oblong images
    
    // Approach 1: Assume [x_min, y_min, x_max, y_max] (standard computer vision format)
    const xMin1 = coord1 / 1000;
    const yMin1 = coord2 / 1000;
    const xMax1 = coord3 / 1000;
    const yMax1 = coord4 / 1000;
    const width1 = xMax1 - xMin1;
    const height1 = yMax1 - yMin1;
    
    // Approach 2: Assume [y_min, x_min, y_max, x_max] (original format)
    const yMin2 = coord1 / 1000;
    const xMin2 = coord2 / 1000;
    const yMax2 = coord3 / 1000;
    const xMax2 = coord4 / 1000;
    const width2 = xMax2 - xMin2;
    const height2 = yMax2 - yMin2;
    
    // Use aspect ratio information to determine which coordinate system to use
    // For rectangular images (wider than tall), approach 1 tends to work better
    // For portrait images (taller than wide), approach 2 may work better
    const isWiderThanTall = imageDimensions.width > imageDimensions.height;
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    
    // Determine which approach to use based on image properties
    // This is a heuristic; we could make this more sophisticated
    const useApproach1 = true; // Default to approach 1 for now
    
    // Apply the selected approach
    let leftPx, topPx, widthPx, heightPx;
    
    if (useApproach1) {
      leftPx = xMin1 * displayDimensions.width;
      topPx = yMin1 * displayDimensions.height;
      widthPx = width1 * displayDimensions.width;
      heightPx = height1 * displayDimensions.height;
      
      console.log(`Using approach 1 for ${tool.label} with values:`, {
        left: leftPx,
        top: topPx,
        width: widthPx,
        height: heightPx
      });
    } else {
      leftPx = xMin2 * displayDimensions.width;
      topPx = yMin2 * displayDimensions.height;
      widthPx = width2 * displayDimensions.width;
      heightPx = height2 * displayDimensions.height;
      
      console.log(`Using approach 2 for ${tool.label} with values:`, {
        left: leftPx,
        top: topPx,
        width: widthPx,
        height: heightPx
      });
    }
    
    return {
      left: `${leftPx}px`,
      top: `${topPx}px`,
      width: `${widthPx}px`,
      height: `${heightPx}px`
    };
  };

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
                const boxStyle = getBoxPositions(tool);
                
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