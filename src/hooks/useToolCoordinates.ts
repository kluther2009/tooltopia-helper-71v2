
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

export function useToolCoordinates({
  imageDimensions,
  displayDimensions,
  orientation,
  coordinateSystem
}: UseToolCoordinatesParams) {
  
  const convertCoordinates = useCallback((box2d: number[]): ConvertedCoordinates => {
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
    
    console.log('Processing coordinates for', orientation, 'image:', {
      original: box2d,
      normalized: { 
        xMin: normalizedXMin, 
        yMin: normalizedYMin, 
        xMax: normalizedXMax, 
        yMax: normalizedYMax 
      }
    });
    
    // Convert normalized coordinates to pixel values
    const pixelXMin = normalizedXMin * imageDimensions.width;
    const pixelYMin = normalizedYMin * imageDimensions.height;
    const pixelXMax = normalizedXMax * imageDimensions.width;
    const pixelYMax = normalizedYMax * imageDimensions.height;
    
    // Scale to display dimensions
    const scaleX = displayDimensions.width / imageDimensions.width;
    const scaleY = displayDimensions.height / imageDimensions.height;
    
    const scaledXMin = pixelXMin * scaleX;
    const scaledYMin = pixelYMin * scaleY;
    const scaledWidth = (pixelXMax - pixelXMin) * scaleX;
    const scaledHeight = (pixelYMax - pixelYMin) * scaleY;
    
    console.log('Converted coordinates for', orientation, 'image:', {
      originalBox2d: box2d,
      normalized: { 
        xMin: normalizedXMin, 
        yMin: normalizedYMin, 
        xMax: normalizedXMax, 
        yMax: normalizedYMax 
      },
      pixels: { 
        xMin: pixelXMin, 
        yMin: pixelYMin, 
        xMax: pixelXMax, 
        yMax: pixelYMax 
      },
      scaled: { 
        xMin: scaledXMin, 
        yMin: scaledYMin, 
        width: scaledWidth, 
        height: scaledHeight 
      }
    });
    
    return {
      xMin: scaledXMin,
      yMin: scaledYMin,
      width: scaledWidth,
      height: scaledHeight
    };
  }, [imageDimensions, displayDimensions, orientation, coordinateSystem]);

  return { convertCoordinates };
}
