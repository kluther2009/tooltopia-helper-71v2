
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CoordinateSystem {
  origin: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  x_axis_direction: 'left-to-right' | 'right-to-left';
  y_axis_direction: 'top-to-bottom' | 'bottom-to-top';
}

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
  const [error, setError] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

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

  useEffect(() => {
    if (!imageContainerRef.current || !imageRef.current) return
    
    const updateDisplayDimensions = () => {
      const img = imageRef.current
      if (img && img.complete) {
        setDisplayDimensions({ 
          width: img.clientWidth, 
          height: img.clientHeight 
        })
        
        console.log("Updated display dimensions:", {
          width: img.clientWidth,
          height: img.clientHeight,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          offsetLeft: img.offsetLeft,
          offsetTop: img.offsetTop
        })
      }
    }
    
    const resizeObserver = new ResizeObserver(updateDisplayDimensions)
    resizeObserver.observe(imageContainerRef.current)
    
    updateDisplayDimensions()
    
    window.addEventListener('resize', updateDisplayDimensions)
    
    return () => {
      if (imageContainerRef.current) {
        resizeObserver.unobserve(imageContainerRef.current)
      }
      window.removeEventListener('resize', updateDisplayDimensions)
    }
  }, [loading])

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      const width = imageRef.current.naturalWidth;
      const height = imageRef.current.naturalHeight;
      
      setImageDimensions({ width, height });
      setDisplayDimensions({ 
        width: imageRef.current.clientWidth, 
        height: imageRef.current.clientHeight 
      });
      
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

    console.log('===== IMAGE LOADED =====');
    console.log('Image dimensions:', {
      natural: { width: naturalWidth, height: naturalHeight },
      display: { width: displayWidth, height: displayHeight },
      offset: { left: img.offsetLeft, top: img.offsetTop },
      position: { x: img.x, y: img.y },
      scaleFactor: { 
        x: displayWidth / naturalWidth, 
        y: displayHeight / naturalHeight,
      },
      coordinateSystem
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

  // Function to convert coordinates based on the explicit coordinate system
  const convertCoordinates = (box2d: number[]) => {
    if (!box2d || box2d.length !== 4) {
      console.error('Invalid bounding box format:', box2d);
      return { xMin: 0, yMin: 0, width: 0, height: 0 };
    }

    // Default interpretation (Gemini's common format)
    // box_2d: [y_min, x_min, y_max, x_max]
    const [yMin, xMin, yMax, xMax] = box2d;
    
    console.log('===== CONVERTING COORDINATES =====');
    console.log('Input box2d:', box2d);
    console.log('Using coordinate system:', coordinateSystem);
    console.log('Image dimensions:', imageDimensions);
    console.log('Display dimensions:', displayDimensions);
    
    // Check if coordinates are normalized (between 0-1000)
    const isNormalized = box2d.every(val => val >= 0 && val <= 1000);
    
    // Convert to pixel values if normalized
    let pixelXMin, pixelYMin, pixelXMax, pixelYMax;
    if (isNormalized) {
      pixelXMin = (xMin / 1000) * imageDimensions.width;
      pixelYMin = (yMin / 1000) * imageDimensions.height;
      pixelXMax = (xMax / 1000) * imageDimensions.width;
      pixelYMax = (yMax / 1000) * imageDimensions.height;
      console.log('Normalized coordinates converted to pixels:', {
        xMin: pixelXMin, 
        yMin: pixelYMin, 
        xMax: pixelXMax, 
        yMax: pixelYMax
      });
    } else {
      pixelXMin = xMin;
      pixelYMin = yMin;
      pixelXMax = xMax;
      pixelYMax = yMax;
      console.log('Using raw pixel coordinates:', {
        xMin: pixelXMin, 
        yMin: pixelYMin, 
        xMax: pixelXMax, 
        yMax: pixelYMax
      });
    }
    
    // Apply coordinate system transformations based on model-provided info
    if (coordinateSystem.origin !== 'top-left') {
      console.log('Adjusting for origin:', coordinateSystem.origin);
      // Adjust for origin position
      if (coordinateSystem.origin === 'top-right') {
        const temp = pixelXMin;
        pixelXMin = imageDimensions.width - pixelXMax;
        pixelXMax = imageDimensions.width - temp;
        console.log('After top-right adjustment:', {
          xMin: pixelXMin, 
          yMin: pixelYMin, 
          xMax: pixelXMax, 
          yMax: pixelYMax
        });
      } else if (coordinateSystem.origin === 'bottom-left') {
        const temp = pixelYMin;
        pixelYMin = imageDimensions.height - pixelYMax;
        pixelYMax = imageDimensions.height - temp;
        console.log('After bottom-left adjustment:', {
          xMin: pixelXMin, 
          yMin: pixelYMin, 
          xMax: pixelXMax, 
          yMax: pixelYMax
        });
      } else if (coordinateSystem.origin === 'bottom-right') {
        const tempX = pixelXMin;
        pixelXMin = imageDimensions.width - pixelXMax;
        pixelXMax = imageDimensions.width - tempX;
        
        const tempY = pixelYMin;
        pixelYMin = imageDimensions.height - pixelYMax;
        pixelYMax = imageDimensions.height - tempY;
        console.log('After bottom-right adjustment:', {
          xMin: pixelXMin, 
          yMin: pixelYMin, 
          xMax: pixelXMax, 
          yMax: pixelYMax
        });
      }
    }
    
    // Adjust for axis direction if needed
    if (coordinateSystem.x_axis_direction === 'right-to-left') {
      console.log('Adjusting for x-axis direction:', coordinateSystem.x_axis_direction);
      const temp = pixelXMin;
      pixelXMin = imageDimensions.width - pixelXMax;
      pixelXMax = imageDimensions.width - temp;
      console.log('After x-axis direction adjustment:', {
        xMin: pixelXMin, 
        yMin: pixelYMin, 
        xMax: pixelXMax, 
        yMax: pixelYMax
      });
    }
    
    if (coordinateSystem.y_axis_direction === 'bottom-to-top') {
      console.log('Adjusting for y-axis direction:', coordinateSystem.y_axis_direction);
      const temp = pixelYMin;
      pixelYMin = imageDimensions.height - pixelYMax;
      pixelYMax = imageDimensions.height - temp;
      console.log('After y-axis direction adjustment:', {
        xMin: pixelXMin, 
        yMin: pixelYMin, 
        xMax: pixelXMax, 
        yMax: pixelYMax
      });
    }
    
    // Scale to display dimensions
    const scaleX = displayDimensions.width / imageDimensions.width;
    const scaleY = displayDimensions.height / imageDimensions.height;
    
    const scaledXMin = pixelXMin * scaleX;
    const scaledYMin = pixelYMin * scaleY;
    const scaledWidth = (pixelXMax - pixelXMin) * scaleX;
    const scaledHeight = (pixelYMax - pixelYMin) * scaleY;
    
    console.log('Scaling factors:', { scaleX, scaleY });
    console.log('Final scaled coordinates:', {
      xMin: scaledXMin, 
      yMin: scaledYMin, 
      width: scaledWidth, 
      height: scaledHeight
    });
    
    return {
      xMin: scaledXMin,
      yMin: scaledYMin,
      width: scaledWidth,
      height: scaledHeight
    };
  }

  // Get image orientation for title display only
  const getImageOrientation = () => {
    if (!imageDimensions.width || !imageDimensions.height) return 'Loading';
    if (imageDimensions.width > imageDimensions.height) return 'Landscape';
    if (imageDimensions.height > imageDimensions.width) return 'Portrait';
    return 'Square';
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Detected Tools ({getImageOrientation()} Photo)
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
                    onError={handleImageError}
                  />
                  
                  {!loading && detectedTools.map((tool, index) => {
                    if (!tool.box_2d || tool.box_2d.length !== 4) {
                      console.error('Invalid bounding box format for tool:', tool);
                      return null;
                    }
                    
                    console.log(`Rendering bounding box for tool #${index + 1} (${tool.label}):`, {
                      originalBox2d: tool.box_2d
                    });
                    
                    const coords = convertCoordinates(tool.box_2d);
                    
                    return (
                      <div key={index}>
                        <div 
                          className="absolute border-2 border-green-500"
                          style={{
                            left: `${coords.xMin}px`,
                            top: `${coords.yMin}px`,
                            width: `${coords.width}px`,
                            height: `${coords.height}px`,
                          }}
                        />
                        <div 
                          className="absolute px-2 py-1 text-xs text-white bg-black/70 rounded"
                          style={{
                            left: `${coords.xMin}px`,
                            top: `${Math.max(0, coords.yMin - 20)}px`,
                          }}
                        >
                          {tool.label}
                        </div>
                      </div>
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
