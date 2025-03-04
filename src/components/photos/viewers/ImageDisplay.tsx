
import { useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToolBoundingBox } from "../ToolBoundingBox"
import { BoundingBoxEditor } from "../BoundingBoxEditor"
import { useImageDimensions } from "@/hooks/useImageDimensions"
import { useToolCoordinates } from "@/hooks/useToolCoordinates"
import { toast } from "sonner"

interface Tool {
  label: string
  box_2d: number[]
}

interface ImageDisplayProps {
  imageUrl: string
  detectedTools: Tool[]
  selectedTool: Tool | null
  isEditing: boolean
  coordinateSystem: any
  onSelectTool: (tool: Tool) => void
  onSaveTool: (tool: Tool) => void
  onCancelEdit: () => void
}

export function ImageDisplay({
  imageUrl,
  detectedTools,
  selectedTool,
  isEditing,
  coordinateSystem,
  onSelectTool,
  onSaveTool,
  onCancelEdit
}: ImageDisplayProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  const {
    loading,
    error,
    imageDimensions,
    displayDimensions,
    orientation,
    handleImageLoad,
    handleImageError
  } = useImageDimensions(imageRef, imageContainerRef)

  const { convertCoordinates } = useToolCoordinates({
    imageDimensions,
    displayDimensions,
    orientation,
    coordinateSystem
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 p-4">
          <p>{error}</p>
          <p className="text-xs break-all mt-1">URL: {imageUrl}</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full w-full rounded-md">
      <div 
        className="relative w-full flex justify-center p-4" 
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
            onError={() => {
              handleImageError();
              toast.error('Failed to load image');
            }}
          />
          
          {!loading && !isEditing && detectedTools.map((tool, index) => {
            if (!tool.box_2d || tool.box_2d.length !== 4) {
              console.error('Invalid bounding box format for tool:', tool);
              return null;
            }
            
            const isHighlighted = selectedTool ? selectedTool.label === tool.label : false;
            const isActive = isHighlighted && !isEditing;
            const coords = convertCoordinates(tool.box_2d);
            
            return (
              <ToolBoundingBox 
                key={index}
                label={tool.label}
                coords={coords}
                isHighlighted={isHighlighted}
                isActive={isActive}
                onClick={() => onSelectTool(tool)}
              />
            );
          })}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          )}

          {selectedTool && isEditing && (
            <BoundingBoxEditor 
              imageRef={imageRef}
              selectedTool={selectedTool}
              orientation={orientation}
              onSave={onSaveTool}
              onCancel={onCancelEdit}
              convertCoordinates={convertCoordinates}
            />
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
