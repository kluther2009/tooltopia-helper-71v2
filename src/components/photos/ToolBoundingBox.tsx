
import React from "react"

interface ToolBoundingBoxProps {
  label: string
  coords: {
    xMin: number
    yMin: number
    width: number
    height: number
  }
}

export function ToolBoundingBox({ label, coords }: ToolBoundingBoxProps) {
  return (
    <>
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
        {label}
      </div>
    </>
  )
}
