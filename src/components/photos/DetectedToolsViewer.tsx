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
  const [useActualScale, setUseActualScale] = useState(true)

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
    const displayWidth = useActualScale ? naturalWidth : img.width
    const displayHeight = useActualScale ? naturalHeight : img.height
    
    setImageDimensions({
      width: naturalWidth,
      height: naturalHeight
    })
    setDisplayDimensions({
      width: displayWidth,
      height: displayHeight
    })
    setLoading(false)

    console.log('Image dimensions:', {
      natural: { width: naturalWidth, height: naturalHeight },
      display: { width: displayWidth, height: displayHeight },
      actualScale: useActualScale,
      scaleFactor: { 
        x: displayWidth / naturalWidth, 
        y: displayHeight / naturalHeight,
        min: Math.min(displayWidth / naturalWidth, displayHeight / naturalHeight),
        max: Math.max(displayWidth / naturalWidth, displayHeight / naturalHeight)
      }
    })
    
    console.log('Image size passed to API:', { width: naturalWidth, height: naturalHeight })
    
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

  const toggleScale = () => {
    setUseActualScale(!useActualScale)
  }

  console.log('All detected tools:', detectedTools)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Detected Tools</DialogTitle>
        </DialogHeader>
        
        <div className="w-full flex flex-col items-center p-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleScale} 
            className="mb-2 self-start"
          >
            {useActualScale ? "Fit to Window" : "Show Actual Size"}
          </Button>

          {error ? (
            <div className="text-red-500 mb-4">
              <p>{error}</p>
              <p className="text-xs break-all mt-1">URL: {imageUrl}</p>
            </div>
          ) : (
            <div className="relative overflow-auto" style={{ 
              maxWidth: '100%', 
              maxHeight: 'calc(80vh - 100px)'
            }}>
              <div className="relative inline-block">
                <img 
                  id="detected-image"
                  src={imageUrl}
                  alt="Tool detection"
                  className={`rounded-lg shadow-sm ${useActualScale ? '' : 'max-w-full h-auto'}`}
                  style={useActualScale ? { width: 'auto', height: 'auto' } : {}}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                
                {!loading && detectedTools.map((tool, index) => {
                  const [yMin, xMin, yMax, xMax] = tool.box_2d;
                  
                  console.log(`Original bounding box for ${tool.label}:`, {
                    yMin, xMin, yMax, xMax,
                    format: 'Gemini [y_min, x_min, y_max, x_max]'
                  });
                  
                  const isNormalized = tool.box_2d.every(val => val <= 1000);
                  console.log(`Is normalized (0-1000 range): ${isNormalized}`);
                  
                  let pixelYMin, pixelXMin, pixelYMax, pixelXMax;
                  
                  if (isNormalized) {
                    pixelYMin = (yMin / 1000) * imageDimensions.height;
                    pixelXMin = (xMin / 1000) * imageDimensions.width;
                    pixelYMax = (yMax / 1000) * imageDimensions.height;
                    pixelXMax = (xMax / 1000) * imageDimensions.width;
                    
                    console.log(`Converted to pixels for ${tool.label}:`, {
                      yMin: pixelYMin,
                      xMin: pixelXMin,
                      yMax: pixelYMax,
                      xMax: pixelXMax
                    });
                  } else {
                    pixelYMin = yMin;
                    pixelXMin = xMin;
                    pixelYMax = yMax;
                    pixelXMax = xMax;
                  }
                  
                  const scaleX = displayDimensions.width / imageDimensions.width;
                  const scaleY = displayDimensions.height / imageDimensions.height;
                  
                  let scale;
                  if (imageDimensions.width > imageDimensions.height) {
                    scale = Math.min(scaleX, scaleY);
                    console.log(`Landscape image: using min scale ${scale}`);
                  } else {
                    scale = Math.max(scaleX, scaleY);
                    console.log(`Portrait image: using max scale ${scale}`);
                  }
                  
                  const effectiveScale = useActualScale ? 1 : scale;
                  
                  let boxStyle;
                  
                  if (useActualScale) {
                    boxStyle = {
                      left: `${pixelXMin}px`,
                      top: `${pixelYMin}px`,
                      width: `${pixelXMax - pixelXMin}px`,
                      height: `${pixelYMax - pixelYMin}px`
                    };
                    
                    console.log(`Using actual pixel values for ${tool.label}:`, boxStyle);
                  } else {
                    const normalizedWidth = imageDimensions.width > 0 ? 100 * (pixelXMax - pixelXMin) / imageDimensions.width : 0;
                    const normalizedHeight = imageDimensions.height > 0 ? 100 * (pixelYMax - pixelYMin) / imageDimensions.height : 0;
                    const normalizedLeft = imageDimensions.width > 0 ? 100 * pixelXMin / imageDimensions.width : 0;
                    const normalizedTop = imageDimensions.height > 0 ? 100 * pixelYMin / imageDimensions.height : 0;
                    
                    boxStyle = {
                      left: `${normalizedLeft}%`,
                      top: `${normalizedTop}%`,
                      width: `${normalizedWidth}%`,
                      height: `${normalizedHeight}%`
                    };
                    
                    console.log(`Final normalized percentages for ${tool.label}:`, {
                      left: normalizedLeft,
                      top: normalizedTop,
                      width: normalizedWidth,
                      height: normalizedHeight,
                      unit: '%'
                    });
                  }
                  
                  return (
                    <div key={index}>
                      <div 
                        className="absolute border-2 border-green-500"
                        style={boxStyle}
                      />
                      <div 
                        className="absolute px-2 py-1 text-xs text-white bg-black/70 rounded"
                        style={useActualScale ? {
                          left: `${pixelXMin}px`,
                          top: `${Math.max(0, pixelYMin - 20)}px`
                        } : {
                          left: `${100 * pixelXMin / imageDimensions.width}%`,
                          top: `${Math.max(0, 100 * pixelYMin / imageDimensions.height - 3)}%`,
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
