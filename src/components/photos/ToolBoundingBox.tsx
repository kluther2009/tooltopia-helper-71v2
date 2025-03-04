
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
  isDraggable?: boolean
  onDragStart?: (e: React.MouseEvent) => void
  onDrag?: (e: React.MouseEvent, direction: string) => void
  onDragEnd?: () => void
}

export function ToolBoundingBox({ 
  label, 
  coords, 
  isHighlighted = false,
  isActive = false,
  onClick,
  isDraggable = false,
  onDragStart,
  onDrag,
  onDragEnd
}: ToolBoundingBoxProps) {
  const borderColor = isHighlighted 
    ? isActive ? "border-blue-500" : "border-yellow-500" 
    : "border-green-500";
  
  const labelColor = isHighlighted
    ? isActive ? "bg-blue-500" : "bg-yellow-500"
    : "bg-black/70";
  
  const handleMouseDown = (e: React.MouseEvent, direction?: string) => {
    e.stopPropagation();
    if (isDraggable && onDragStart) {
      onDragStart(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, direction?: string) => {
    e.stopPropagation();
    if (isDraggable && onDrag) {
      onDrag(e, direction || 'move');
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggable && onDragEnd) {
      onDragEnd();
    }
  };
  
  return (
    <>
      <div 
        className={`absolute border-2 ${borderColor} ${isDraggable ? 'cursor-move' : 'cursor-pointer'} transition-colors duration-200`}
        style={{
          left: `${coords.xMin}px`,
          top: `${coords.yMin}px`,
          width: `${coords.width}px`,
          height: `${coords.height}px`,
        }}
        onClick={isDraggable ? undefined : onClick}
        onMouseDown={isDraggable ? handleMouseDown : undefined}
        onMouseMove={isDraggable ? handleMouseMove : undefined}
        onMouseUp={isDraggable ? handleMouseUp : undefined}
      />
      {/* Resize handles when in edit mode */}
      {isDraggable && (
        <>
          {/* Top-left corner */}
          <div 
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: `${coords.xMin}px`, top: `${coords.yMin}px` }}
            onMouseDown={(e) => handleMouseDown(e, 'top-left')}
            onMouseMove={(e) => handleMouseMove(e, 'top-left')}
            onMouseUp={handleMouseUp}
          />
          {/* Top-right corner */}
          <div 
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: `${coords.xMin + coords.width}px`, top: `${coords.yMin}px` }}
            onMouseDown={(e) => handleMouseDown(e, 'top-right')}
            onMouseMove={(e) => handleMouseMove(e, 'top-right')}
            onMouseUp={handleMouseUp}
          />
          {/* Bottom-left corner */}
          <div 
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize -translate-x-1/2 translate-y-1/2 z-20"
            style={{ left: `${coords.xMin}px`, top: `${coords.yMin + coords.height}px` }}
            onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
            onMouseMove={(e) => handleMouseMove(e, 'bottom-left')}
            onMouseUp={handleMouseUp}
          />
          {/* Bottom-right corner */}
          <div 
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize translate-x-1/2 translate-y-1/2 z-20"
            style={{ left: `${coords.xMin + coords.width}px`, top: `${coords.yMin + coords.height}px` }}
            onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
            onMouseMove={(e) => handleMouseMove(e, 'bottom-right')}
            onMouseUp={handleMouseUp}
          />
        </>
      )}
      <div 
        className={`absolute px-2 py-1 text-xs text-white ${labelColor} rounded ${isDraggable ? 'cursor-move' : 'cursor-pointer'} transition-colors duration-200`}
        style={{
          left: `${coords.xMin}px`,
          top: `${Math.max(0, coords.yMin - 20)}px`,
        }}
        onClick={isDraggable ? undefined : onClick}
      >
        {label}
      </div>
    </>
  )
}
