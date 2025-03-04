
import React from "react";
import { Tool } from "./types";
import { BoxCoordinates } from "./types";

interface BoundingBoxProps {
  tool: Tool;
  coords: BoxCoordinates;
  index: number;
}

export function BoundingBox({ tool, coords, index }: BoundingBoxProps) {
  console.log(`===== BOUNDING BOX RENDER #${index + 1} =====`);
  console.log(`Tool: ${tool.label}`);
  console.log('Original box2d:', tool.box_2d);
  console.log('Rendered CSS properties:', coords);

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
