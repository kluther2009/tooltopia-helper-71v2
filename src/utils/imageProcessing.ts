/**
 * Utility functions for image processing and orientation correction
 */

/**
 * Creates an image element from a URL and returns a promise that resolves when the image is loaded
 */
export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Needed for CORS
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

/**
 * Fixes image orientation based on EXIF data and standardizes to a consistent orientation
 * Returns a data URL of the corrected image
 */
export const fixImageOrientation = async (imageUrl: string, maxDimension = 1024): Promise<string> => {
  try {
    // Load the image
    const img = await loadImage(imageUrl);
    
    // Create a canvas to draw the corrected image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Unable to get canvas context');
    }
    
    // Determine the target dimensions while maintaining aspect ratio
    let width = img.width;
    let height = img.height;
    
    // Resize if needed, maintaining aspect ratio
    if (width > height && width > maxDimension) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else if (height > maxDimension) {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
    
    // Set canvas dimensions to the resized image
    canvas.width = width;
    canvas.height = height;
    
    // Draw the image with the correct orientation and size
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convert to data URL (JPEG format with quality 0.9)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    // Log the original and processed dimensions
    console.log('Image processing:', {
      original: { width: img.width, height: img.height },
      processed: { width, height },
      orientation: width > height ? 'landscape' : 'portrait',
      aspectRatio: (width / height).toFixed(2)
    });
    
    return dataUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    return imageUrl; // Return original URL if processing fails
  }
};

/**
 * Extracts Base64 data from a data URL
 */
export const dataUrlToBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1] || '';
};

/**
 * Transforms bounding box coordinates from Gemini format to display format
 * Always assumes Gemini returns [y_min, x_min, y_max, x_max] format
 */
export const transformBoundingBox = (
  box_2d: number[], 
  displayWidth: number, 
  displayHeight: number
) => {
  // Extract coordinates (always using y_min, x_min, y_max, x_max format)
  const [yMin, xMin, yMax, xMax] = box_2d;
  
  // Convert from 0-1000 scale to 0-1 scale
  const normalizedXMin = xMin / 1000;
  const normalizedYMin = yMin / 1000;
  const normalizedXMax = xMax / 1000;
  const normalizedYMax = yMax / 1000;
  
  // Calculate width and height
  const normalizedWidth = normalizedXMax - normalizedXMin;
  const normalizedHeight = normalizedYMax - normalizedYMin;
  
  // Scale to the image's display dimensions
  return {
    left: `${normalizedXMin * displayWidth}px`,
    top: `${normalizedYMin * displayHeight}px`,
    width: `${normalizedWidth * displayWidth}px`,
    height: `${normalizedHeight * displayHeight}px`
  };
};
