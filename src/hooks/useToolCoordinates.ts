
import { useCallback } from "react"

export interface CoordinateSystem {
  origin: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  x_axis_direction: 'left-to-right' | 'right-to-left';
  y_axis_direction: 'top-to-bottom' | 'bottom-to-top';
}

interface ConvertedCoordinates {
  xMin: number;
  yMin: number;
  width: number;
  height: number;
}

interface UseToolCoordinatesParams {
  imageDimensions: { width: number, height: number };
  displayDimensions: { width: number, height: number };
  orientation: 'landscape' | 'portrait' | 'square';
  coordinateSystem: CoordinateSystem;
}

export function normalizeBox2d(box2d: number[], orientation: 'landscape' | 'portrait' | 'square'): ConvertedCoordinates {
  if (!box2d || box2d.length !== 4) {
    console.error('Invalid bounding box format:', box2d);
    return { xMin: 0, yMin: 0, width: 0, height: 0 };
  }

  let normalizedXMin, normalizedYMin, normalizedXMax, normalizedYMax;
  
  // For portrait images, API returns [x_min, y_min, x_max, y_max]
  // For landscape/square, API returns [y_min, x_min, y_max, x_max]
  if (orientation === 'portrait') {
    // Directly use the coordinates as [x_min, y_min, x_max, y_max]
    [normalizedXMin, normalizedYMin, normalizedXMax, normalizedYMax] = box2d.map(coord => coord / 1000);
  } else {
    // For landscape/square, use the original format [y_min, x_min, y_max, x_max]
    const [yMin, xMin, yMax, xMax] = box2d;
    normalizedXMin = xMin / 1000;
    normalizedYMin = yMin / 1000;
    normalizedXMax = xMax / 1000;
    normalizedYMax = yMax / 1000;
  }
  
  return {
    xMin: normalizedXMin,
    yMin: normalizedYMin,
    width: normalizedXMax - normalizedXMin,
    height: normalizedYMax - normalizedYMin
  };
}

export function useToolCoordinates({
  imageDimensions,
  displayDimensions,
  orientation,
  coordinateSystem
}: UseToolCoordinatesParams) {
  
  const convertCoordinates = useCallback((box2d: number[]): ConvertedCoordinates => {
    const normalized = normalizeBox2d(box2d, orientation);
    
    // Convert normalized coordinates to pixel values
    const pixelXMin = normalized.xMin * imageDimensions.width;
    const pixelYMin = normalized.yMin * imageDimensions.height;
    const pixelXMax = (normalized.xMin + normalized.width) * imageDimensions.width;
    const pixelYMax = (normalized.yMin + normalized.height) * imageDimensions.height;
    
    // Scale to display dimensions
    const scaleX = displayDimensions.width / imageDimensions.width;
    const scaleY = displayDimensions.height / imageDimensions.height;
    
    const scaledXMin = pixelXMin * scaleX;
    const scaledYMin = pixelYMin * scaleY;
    const scaledWidth = (pixelXMax - pixelXMin) * scaleX;
    const scaledHeight = (pixelYMax - pixelYMin) * scaleY;
    
    return {
      xMin: scaledXMin,
      yMin: scaledYMin,
      width: scaledWidth,
      height: scaledHeight
    };
  }, [imageDimensions, displayDimensions, orientation, coordinateSystem]);

  return { convertCoordinates };
}
