import { RefObject } from 'react';

interface TouchCoordinates {
  x: number;
  y: number;
}

export const getTouchCoordinates = (
  touch: Touch | React.Touch,
  canvasRef: RefObject<HTMLCanvasElement>
): TouchCoordinates | null => {
  const canvas = canvasRef.current;
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width / dpr);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height / dpr);

  return { x, y };
};

export const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);