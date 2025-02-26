
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

    // Log the dimensions
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

  // Log detected tools when they change
  console.log('All detected tools:', detectedTools)
  
  // Find and log tape measure specifically
  const tapeMeasure = detectedTools.find(tool => 
    tool.label.toLowerCase().includes('tape') || 
    tool.label.toLowerCase().includes('measure')
  )
  if (tapeMeasure) {
    console.log('Tape measure coordinates:', {
      label: tapeMeasure.label,
      coordinates: tapeMeasure.box_2d,
      x1: tapeMeasure.box_2d[0],
      y1: tapeMeasure.box_2d[1],
      x2: tapeMeasure.box_2d[2],
      y2: tapeMeasure.box_2d[3]
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
                // Get coordinates from the API response
                const [x1, y1, x2, y2] = tool.box_2d

                // Calculate the scaling factor between natural and display dimensions
                const scaleX = displayDimensions.width / imageDimensions.width
                const scaleY = displayDimensions.height / imageDimensions.height

                // Scale the coordinates to match the displayed image size
                const scaledX1 = x1 * scaleX
                const scaledY1 = y1 * scaleY
                const scaledWidth = (x2 - x1) * scaleX
                const scaledHeight = (y2 - y1) * scaleY

                const boxStyle = {
                  left: scaledX1,
                  top: scaledY1,
                  width: scaledWidth,
                  height: scaledHeight,
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
                        left: scaledX1,
                        top: Math.max(0, scaledY1 - 24),
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
