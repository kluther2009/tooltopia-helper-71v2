import { useState, useRef, RefObject } from 'react';
import { CanvasCoordinates } from './types';

interface UseCanvasInteractionProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  onRectangleDrawn?: (coordinates: CanvasCoordinates) => void;
}

export const useCanvasInteraction = ({ 
  canvasRef, 
  onRectangleDrawn 
}: UseCanvasInteractionProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const isReadOnly = !onRectangleDrawn;

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = (canvas.width / rect.width) * dpr;
    const scaleY = (canvas.height / rect.height) * dpr;

    if ('touches' in e) {
        // Handle touchend event which has no touches
        const touch = e.touches[0] || (e as TouchEvent).changedTouches?.[0];
        if (!touch) return null;
        
        return {
            x: ((touch.clientX - rect.left) * scaleX) / dpr,
            y: ((touch.clientY - rect.top) * scaleY) / dpr
        };
    } else if ('clientX' in e) {
        return {
            x: ((e.clientX - rect.left) * scaleX) / dpr,
            y: ((e.clientY - rect.top) * scaleY) / dpr
        };
    }
    return null;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly) return;
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    setStartPos(coords);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly || !isDrawing || !startPos || !canvasRef.current) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    return { startPos, currentPos: coords };
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent | TouchEvent) => {
    if (isReadOnly || !isDrawing || !startPos || !canvasRef.current) return;

    // Prevent default behavior for touch events
    if ('touches' in e) {
        e.preventDefault();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    const coordinates = {
      x: Math.min(startPos.x, coords.x),
      y: Math.min(startPos.y, coords.y),
      width: Math.abs(coords.x - startPos.x),
      height: Math.abs(coords.y - startPos.y)
    };

    setIsDrawing(false);
    setStartPos(null);
    onRectangleDrawn?.(coordinates);
  };
    
  return {
    isDrawing,
    startPos,
    isReadOnly,
    handleStart,
    handleMove,
    handleEnd,
    setIsDrawing
  };
};
