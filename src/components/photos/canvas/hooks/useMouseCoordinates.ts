import { RefObject } from 'react';

export const useMouseCoordinates = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const getMouseCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width / dpr),
      y: (clientY - rect.top) * (canvas.height / rect.height / dpr)
    };
  };

  return { getMouseCoordinates };
};