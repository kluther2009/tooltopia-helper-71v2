
import { BoxCoordinates, CoordinateSystem, ImageDimensions } from "./types";

export const convertCoordinates = (
  box2d: number[],
  imageDimensions: ImageDimensions,
  displayDimensions: ImageDimensions,
  coordinateSystem: CoordinateSystem
): BoxCoordinates => {
  if (!box2d || box2d.length !== 4) {
    console.error('Invalid bounding box format:', box2d);
    return { xMin: 0, yMin: 0, width: 0, height: 0 };
  }

  // Default interpretation (Gemini's common format)
  // box_2d: [y_min, x_min, y_max, x_max]
  const [yMin, xMin, yMax, xMax] = box2d;
  
  console.log('===== CONVERTING COORDINATES =====');
  console.log('Input box2d:', box2d);
  console.log('Using coordinate system:', coordinateSystem);
  console.log('Image dimensions:', imageDimensions);
  console.log('Display dimensions:', displayDimensions);
  
  // Check if coordinates are normalized (between 0-1000)
  const isNormalized = box2d.every(val => val >= 0 && val <= 1000);
  
  // Convert to pixel values if normalized
  let pixelXMin, pixelYMin, pixelXMax, pixelYMax;
  if (isNormalized) {
    pixelXMin = (xMin / 1000) * imageDimensions.width;
    pixelYMin = (yMin / 1000) * imageDimensions.height;
    pixelXMax = (xMax / 1000) * imageDimensions.width;
    pixelYMax = (yMax / 1000) * imageDimensions.height;
    console.log('Normalized coordinates converted to pixels:', {
      xMin: pixelXMin, 
      yMin: pixelYMin, 
      xMax: pixelXMax, 
      yMax: pixelYMax
    });
  } else {
    pixelXMin = xMin;
    pixelYMin = yMin;
    pixelXMax = xMax;
    pixelYMax = yMax;
    console.log('Using raw pixel coordinates:', {
      xMin: pixelXMin, 
      yMin: pixelYMin, 
      xMax: pixelXMax, 
      yMax: pixelYMax
    });
  }
  
  // Apply coordinate system transformations based on model-provided info
  if (coordinateSystem.origin !== 'top-left') {
    console.log('Adjusting for origin:', coordinateSystem.origin);
    // Adjust for origin position
    if (coordinateSystem.origin === 'top-right') {
      const temp = pixelXMin;
      pixelXMin = imageDimensions.width - pixelXMax;
      pixelXMax = imageDimensions.width - temp;
      console.log('After top-right adjustment:', {
        xMin: pixelXMin, 
        yMin: pixelYMin, 
        xMax: pixelXMax, 
        yMax: pixelYMax
      });
    } else if (coordinateSystem.origin === 'bottom-left') {
      const temp = pixelYMin;
      pixelYMin = imageDimensions.height - pixelYMax;
      pixelYMax = imageDimensions.height - temp;
      console.log('After bottom-left adjustment:', {
        xMin: pixelXMin, 
        yMin: pixelYMin, 
        xMax: pixelXMax, 
        yMax: pixelYMax
      });
    } else if (coordinateSystem.origin === 'bottom-right') {
      const tempX = pixelXMin;
      pixelXMin = imageDimensions.width - pixelXMax;
      pixelXMax = imageDimensions.width - tempX;
      
      const tempY = pixelYMin;
      pixelYMin = imageDimensions.height - pixelYMax;
      pixelYMax = imageDimensions.height - tempY;
      console.log('After bottom-right adjustment:', {
        xMin: pixelXMin, 
        yMin: pixelYMin, 
        xMax: pixelXMax, 
        yMax: pixelYMax
      });
    }
  }
  
  // Adjust for axis direction if needed
  if (coordinateSystem.x_axis_direction === 'right-to-left') {
    console.log('Adjusting for x-axis direction:', coordinateSystem.x_axis_direction);
    const temp = pixelXMin;
    pixelXMin = imageDimensions.width - pixelXMax;
    pixelXMax = imageDimensions.width - temp;
    console.log('After x-axis direction adjustment:', {
      xMin: pixelXMin, 
      yMin: pixelYMin, 
      xMax: pixelXMax, 
      yMax: pixelYMax
    });
  }
  
  if (coordinateSystem.y_axis_direction === 'bottom-to-top') {
    console.log('Adjusting for y-axis direction:', coordinateSystem.y_axis_direction);
    const temp = pixelYMin;
    pixelYMin = imageDimensions.height - pixelYMax;
    pixelYMax = imageDimensions.height - temp;
    console.log('After y-axis direction adjustment:', {
      xMin: pixelXMin, 
      yMin: pixelYMin, 
      xMax: pixelXMax, 
      yMax: pixelYMax
    });
  }
  
  // Scale to display dimensions
  const scaleX = displayDimensions.width / imageDimensions.width;
  const scaleY = displayDimensions.height / imageDimensions.height;
  
  const scaledXMin = pixelXMin * scaleX;
  const scaledYMin = pixelYMin * scaleY;
  const scaledWidth = (pixelXMax - pixelXMin) * scaleX;
  const scaledHeight = (pixelYMax - pixelYMin) * scaleY;
  
  console.log('Scaling factors:', { scaleX, scaleY });
  console.log('Final scaled coordinates:', {
    xMin: scaledXMin, 
    yMin: scaledYMin, 
    width: scaledWidth, 
    height: scaledHeight
  });
  
  return {
    xMin: scaledXMin,
    yMin: scaledYMin,
    width: scaledWidth,
    height: scaledHeight
  };
};

export const getImageOrientation = (dimensions: ImageDimensions): string => {
  if (!dimensions.width || !dimensions.height) return 'Loading';
  if (dimensions.width > dimensions.height) return 'Landscape';
  if (dimensions.height > dimensions.width) return 'Portrait';
  return 'Square';
};
