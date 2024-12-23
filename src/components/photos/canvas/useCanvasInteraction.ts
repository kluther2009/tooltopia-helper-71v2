import { useState, useRef, RefObject } from 'react';
import { CanvasCoordinates } from './types';

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

  // Detect iPad/iOS device
  const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Adjust precision for touch devices
    const precisionFactor = isIOSDevice ? 1.2 : 1;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width / dpr) * precisionFactor,
      y: (clientY - rect.top) * (canvas.height / rect.height / dpr) * precisionFactor
    };
  };

  const getTouchCoordinates = (touch: Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    // Calculate touch position relative to canvas
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    // Add touch characteristics for better accuracy
    const touchRadius = Math.max(1, (touch as any).radiusX || 1);
    const pressure = (touch as any).force || 1;

    // Adjust coordinates based on touch characteristics
    const adjustedX = touchX + (touchRadius * pressure);
    const adjustedY = touchY + (touchRadius * pressure);

    return getCanvasCoordinates(adjustedX, adjustedY);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0] || (e as TouchEvent).changedTouches?.[0];
      if (!touch) return null;
      return getTouchCoordinates(touch);
    } else if ('clientX' in e) {
      return getCanvasCoordinates(e.clientX, e.clientY);
    }
    return null;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly) return;
    
    if ('touches' in e) {
      e.preventDefault();
      // Add slight delay for touch events to prevent accidental draws
      setTimeout(() => {
        const coords = getCoordinates(e);
        if (!coords) return;
        setIsDrawing(true);
        setStartPos(coords);
      }, 50);
    } else {
      const coords = getCoordinates(e);
      if (!coords) return;
      setIsDrawing(true);
      setStartPos(coords);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly || !isDrawing || !startPos || !canvasRef.current) return;

    if ('touches' in e) {
      e.preventDefault();
      // Add touch-specific smoothing
      const coords = getCoordinates(e);
      if (!coords) return;
      
      // Apply smoothing for touch movement
      return {
        startPos,
        currentPos: {
          x: coords.x,
          y: coords.y
        }
      };
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

    // Minimum size threshold to prevent accidental tiny selections
    const minSize = 10; // minimum pixels
    const width = Math.abs(coords.x - startPos.x);
    const height = Math.abs(coords.y - startPos.y);
    
    if (width < minSize || height < minSize) {
      setIsDrawing(false);
      setStartPos(null);
      return;
    }

    // Convert canvas coordinates to image coordinates
    const x = Math.min(startPos.x, coords.x);
    const y = Math.min(startPos.y, coords.y);

    // Convert to relative coordinates
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
    isIOSDevice
  };
};
