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

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0] || (e as TouchEvent).changedTouches?.[0];
      if (!touch) return null;
      return getCanvasCoordinates(touch.clientX, touch.clientY);
    } else if ('clientX' in e) {
      return getCanvasCoordinates(e.clientX, e.clientY);
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

    if ('touches' in e) {
      e.preventDefault();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const coordinates = {
      x: Math.min(startPos.x, coords.x) / scaleX,
      y: Math.min(startPos.y, coords.y) / scaleY,
      width: Math.abs(coords.x - startPos.x) / scaleX,
      height: Math.abs(coords.y - startPos.y) / scaleY
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