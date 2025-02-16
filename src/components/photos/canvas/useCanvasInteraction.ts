
import { useState, RefObject } from 'react';
import { CanvasCoordinates } from './types';
import { getTouchCoordinates, isIOSDevice } from './utils/touchUtils';
import { useMouseCoordinates } from './hooks/useMouseCoordinates';

interface UseCanvasInteractionProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  onRectangleDrawn?: (coordinates: CanvasCoordinates) => void;
  imageMetrics?: { scale: number; x: number; y: number } | null;
}

export const useCanvasInteraction = ({ 
  canvasRef, 
  onRectangleDrawn,
  imageMetrics 
}: UseCanvasInteractionProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const isReadOnly = !onRectangleDrawn;
  const { getMouseCoordinates } = useMouseCoordinates(canvasRef);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0] || (e as TouchEvent).changedTouches?.[0];
      if (!touch) return null;
      return getTouchCoordinates(touch, canvasRef);
    } else if ('clientX' in e) {
      return getMouseCoordinates(e.clientX, e.clientY);
    }
    return null;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly) return;
    
    const coords = getCoordinates(e);
    if (!coords) return;

    if ('touches' in e) {
      e.preventDefault();
      setTimeout(() => {
        setIsDrawing(true);
        setStartPos(coords);
      }, 50);
    } else {
      setIsDrawing(true);
      setStartPos(coords);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly || !isDrawing || !startPos || !canvasRef.current) return;

    if ('touches' in e) {
      e.preventDefault();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    return { startPos, currentPos: coords };
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent | TouchEvent) => {
    if (isReadOnly || !isDrawing || !startPos || !canvasRef.current || !imageMetrics) return;

    if ('touches' in e) {
      e.preventDefault();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    const minSize = 10;
    const width = Math.abs(coords.x - startPos.x);
    const height = Math.abs(coords.y - startPos.y);
    
    if (width < minSize || height < minSize) {
      setIsDrawing(false);
      setStartPos(null);
      return;
    }

    const x = Math.min(startPos.x, coords.x);
    const y = Math.min(startPos.y, coords.y);

    const relativeCoordinates = {
      x: (x - imageMetrics.x) / imageMetrics.scale,
      y: (y - imageMetrics.y) / imageMetrics.scale,
      width: width / imageMetrics.scale,
      height: height / imageMetrics.scale
    };

    setIsDrawing(false);
    setStartPos(null);
    onRectangleDrawn?.(relativeCoordinates);
  };
    
  return {
    isDrawing,
    startPos,
    isReadOnly,
    handleStart,
    handleMove,
    handleEnd,
    setIsDrawing,
    isIOSDevice,
    getMouseCoordinates
  };
};
