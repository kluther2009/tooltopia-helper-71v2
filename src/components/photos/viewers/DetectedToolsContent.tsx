
import { useState } from "react"
import { CoordinateSystem } from "@/hooks/useToolCoordinates"
import { DetectedToolList } from "../list/DetectedToolList"
import { ImageDisplay } from "./ImageDisplay"

interface Tool {
  label: string
  box_2d: number[]
}

interface DetectedToolsContentProps {
  imageUrl: string
  detectedTools: Tool[]
  selectedTool: Tool | null
  isEditing: boolean
  onSelectTool: (tool: Tool) => void
  onSaveTool: (tool: Tool) => void
  onCancelEdit: () => void
  onRenameTool: (oldLabel: string, newLabel: string) => void
  onDeleteTool: (tool: Tool) => void
}

export function DetectedToolsContent({
  imageUrl,
  detectedTools,
  selectedTool,
  isEditing,
  onSelectTool,
  onSaveTool,
  onCancelEdit,
  onRenameTool,
  onDeleteTool
}: DetectedToolsContentProps) {
  const [coordinateSystem] = useState<CoordinateSystem>({
    origin: 'top-left',
    x_axis_direction: 'left-to-right',
    y_axis_direction: 'top-to-bottom'
  })

  return (
    <div className="flex h-[calc(90vh-120px)]">
      <div className="w-1/4 max-w-[250px] border-r">
        <DetectedToolList 
          tools={detectedTools}
          selectedTool={selectedTool}
          onSelectTool={onSelectTool}
          onSaveTool={onSaveTool}
          isEditing={isEditing}
          onRenameTool={onRenameTool}
          onDeleteTool={onDeleteTool}
        />
      </div>
      
      <div className="flex-1 relative">
        <ImageDisplay
          imageUrl={imageUrl}
          detectedTools={detectedTools}
          selectedTool={selectedTool}
          isEditing={isEditing}
          coordinateSystem={coordinateSystem}
          onSelectTool={onSelectTool}
          onSaveTool={onSaveTool}
          onCancelEdit={onCancelEdit}
        />
      </div>
    </div>
  )
}
