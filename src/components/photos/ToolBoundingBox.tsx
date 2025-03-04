
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
  onClick?: () => void
}

export function ToolBoundingBox({ 
  label, 
  coords, 
  isHighlighted = false,
  isActive = false,
  onClick 
}: ToolBoundingBoxProps) {
  const borderColor = isHighlighted 
    ? isActive ? "border-blue-500" : "border-yellow-500" 
    : "border-green-500";
  
  const labelColor = isHighlighted
    ? isActive ? "bg-blue-500" : "bg-yellow-500"
    : "bg-black/70";
  
  return (
    <>
      <div 
        className={`absolute border-2 ${borderColor} cursor-pointer transition-colors duration-200`}
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
