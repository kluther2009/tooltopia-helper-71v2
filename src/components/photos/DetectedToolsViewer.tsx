
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
  
  const tapeMeasure = detectedTools.find(tool => 
    tool.label.toLowerCase().includes('tape') || 
    tool.label.toLowerCase().includes('measure')
  )
  if (tapeMeasure) {
    console.log('Tape measure coordinates:', {
      label: tapeMeasure.label,
      coordinates: tapeMeasure.box_2d,
      originalY1: tapeMeasure.box_2d[0],
      originalX1: tapeMeasure.box_2d[1],
      originalY2: tapeMeasure.box_2d[2],
      originalX2: tapeMeasure.box_2d[3]
    })
  }

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
                // Get normalized coordinates (0-1000) from the API response
                // Format is [y_min, x_min, y_max, x_max]
                const [y1, x1, y2, x2] = tool.box_2d

                // Convert from 1000x1000 normalized coordinates to actual image dimensions
                const imageX1 = (x1 / 1000) * imageDimensions.width
                const imageY1 = (y1 / 1000) * imageDimensions.height
                const imageX2 = (x2 / 1000) * imageDimensions.width
                const imageY2 = (y2 / 1000) * imageDimensions.height

                // Calculate display scaling factors
                const scaleX = displayDimensions.width / imageDimensions.width
                const scaleY = displayDimensions.height / imageDimensions.height

                // Scale to final display dimensions
                const finalX1 = imageX1 * scaleX
                const finalY1 = imageY1 * scaleY
                const finalWidth = (imageX2 - imageX1) * scaleX
                const finalHeight = (imageY2 - imageY1) * scaleY

                // Create box style
                const boxStyle = {
                  left: finalX1,
                  top: finalY1,
                  width: finalWidth,
                  height: finalHeight,
                } as const

                return (
                  <div key={index}>
                    <div 
                      className="absolute border-2 border-green-500"
                      style={boxStyle}
                    />
                    <div 
                      className="absolute px-2 py-1 text-xs text-white bg-black/70 rounded"
                      style={{
                        left: finalX1,
                        top: Math.max(0, finalY1 - 24),
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
