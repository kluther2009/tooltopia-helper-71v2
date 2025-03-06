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
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void
  onDrag?: (e: React.MouseEvent | React.TouchEvent, direction: string) => void
  onDragEnd?: (e: React.MouseEvent | React.TouchEvent) => void
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

  const handleEventWrapper = (handler?: (e: React.MouseEvent | React.TouchEvent) => void) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    handler?.(e);
  };

  const handleCornerEventWrapper = (handler: ((e: React.MouseEvent | React.TouchEvent, direction: string) => void) | undefined, direction: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (handler) {
      handler(e, direction);
    }
  };
  
  return (
    <>
      <div 
        className={`absolute border-2 ${borderColor} ${isDraggable ? 'cursor-move touch-none' : 'cursor-pointer'} transition-colors duration-200`}
        style={{
          left: `${coords.xMin}px`,
          top: `${coords.yMin}px`,
          width: `${coords.width}px`,
          height: `${coords.height}px`,
        }}
        onClick={!isDraggable ? onClick : undefined}
        onMouseDown={isDraggable ? handleEventWrapper(onDragStart) : undefined}
        onTouchStart={isDraggable ? handleEventWrapper(onDragStart) : undefined}
        onMouseMove={isDraggable ? handleEventWrapper((e) => onDrag?.(e, 'move')) : undefined}
        onTouchMove={isDraggable ? handleEventWrapper((e) => onDrag?.(e, 'move')) : undefined}
        onMouseUp={isDraggable ? handleEventWrapper(onDragEnd) : undefined}
        onTouchEnd={isDraggable ? handleEventWrapper(onDragEnd) : undefined}
      />

      {isDraggable && (
        <>
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
            <div 
              key={corner}
              className={`absolute w-8 h-8 bg-white border-2 border-blue-500 rounded-full cursor-${corner}-resize touch-none -translate-x-1/2 -translate-y-1/2 z-20`}
              style={{
                left: `${coords.xMin + (corner.includes('right') ? coords.width : 0)}px`,
                top: `${coords.yMin + (corner.includes('bottom') ? coords.height : 0)}px`,
              }}
              onMouseDown={handleEventWrapper((e) => onDragStart?.(e))}
              onTouchStart={handleEventWrapper((e) => onDragStart?.(e))}
              onMouseMove={handleEventWrapper((e) => onDrag?.(e, corner))}
              onTouchMove={handleEventWrapper((e) => onDrag?.(e, corner))}
              onMouseUp={handleEventWrapper(onDragEnd)}
              onTouchEnd={handleEventWrapper(onDragEnd)}
            />
          ))}
        </>
      )}

      <div 
        className={`absolute px-2 py-1 text-xs text-white ${labelColor} rounded ${isDraggable ? 'cursor-move' : 'cursor-pointer'} transition-colors duration-200`}
        style={{
          left: `${coords.xMin}px`,
          top: `${Math.max(0, coords.yMin - 20)}px`,
        }}
        onClick={!isDraggable ? onClick : undefined}
      >
        {label}
      </div>
    </>
  );
}
