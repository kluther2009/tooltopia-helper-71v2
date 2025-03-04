
import React from "react"

interface ToolBoundingBoxProps {
  label: string
  coords: {
    xMin: number
    yMin: number
    width: number
    height: number
  }
  isHighlighted?: boolean
  isActive?: boolean
  isEditing?: boolean
  onClick?: () => void
}

export function ToolBoundingBox({ 
  label, 
  coords, 
  isHighlighted = false,
  isActive = false,
  isEditing = false,
  onClick 
}: ToolBoundingBoxProps) {
  let borderColor = "border-green-500";
  let labelColor = "bg-black/70";
  
  if (isHighlighted) {
    if (isEditing) {
      borderColor = "border-purple-500";
      labelColor = "bg-purple-500";
    } else if (isActive) {
      borderColor = "border-blue-500";
      labelColor = "bg-blue-500";
    } else {
      borderColor = "border-yellow-500";
      labelColor = "bg-yellow-500";
    }
  }
  
  return (
    <>
      <div 
        className={`absolute border-2 ${borderColor} cursor-pointer transition-colors duration-200 ${isEditing ? 'border-dashed' : ''}`}
        style={{
          left: `${coords.xMin}px`,
          top: `${coords.yMin}px`,
          width: `${coords.width}px`,
          height: `${coords.height}px`,
        }}
        onClick={onClick}
      />
      <div 
        className={`absolute px-2 py-1 text-xs text-white ${labelColor} rounded cursor-pointer transition-colors duration-200`}
        style={{
          left: `${coords.xMin}px`,
          top: `${Math.max(0, coords.yMin - 20)}px`,
        }}
        onClick={onClick}
      >
        {label}
      </div>
    </>
  )
}
