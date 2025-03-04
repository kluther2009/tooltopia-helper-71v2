
import React from "react";
import { Tool } from "./types";
import { BoxCoordinates } from "./types";

interface BoundingBoxProps {
  tool: Tool;
  coords: BoxCoordinates;
  index: number;
}

export function BoundingBox({ tool, coords, index }: BoundingBoxProps) {
  // Simple log just once when the component renders
  if (index === 0) {
    console.log('===== BOUNDING BOXES RENDERING =====');
  }

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
}
