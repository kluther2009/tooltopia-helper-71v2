
import { useEffect, useState } from "react";

interface Annotation {
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  photo: {
    file_path: string;
  } | null;
}

interface AnnotationImageProps {
  annotation: Annotation;
  photoUrl: string;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export function AnnotationImage({ annotation, photoUrl, onLoadingChange, onError }: AnnotationImageProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const loadImage = async () => {
      onLoadingChange(true);
      onError(null);

      try {
        console.log('Using photo URL:', photoUrl);
        console.log('Annotation coordinates:', annotation.coordinates);
        
        // Create an image to get its dimensions
        const img = new Image();
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          onError('Failed to load image dimensions');
        };
        img.src = photoUrl;
      } catch (error) {
        console.error('Error getting image URL:', error);
        onError('Failed to load image');
      } finally {
        onLoadingChange(false);
      }
    };

    loadImage();
  }, [photoUrl, onError, onLoadingChange, annotation]);

  if (!photoUrl) return null;

  // Ensure coordinates are numbers
  const x = typeof annotation.coordinates.x === 'number' ? annotation.coordinates.x : 0;
  const y = typeof annotation.coordinates.y === 'number' ? annotation.coordinates.y : 0;
  const width = typeof annotation.coordinates.width === 'number' ? annotation.coordinates.width : 0;
  const height = typeof annotation.coordinates.height === 'number' ? annotation.coordinates.height : 0;
  
  console.log('Rendering annotation box with dimensions:', {
    x: `${x * 1000}px`,
    y: `${y * 1000}px`, 
    width: `${width * 1000}px`, 
    height: `${height * 1000}px`,
    imageSize
  });

  return (
    <div 
      className="relative overflow-hidden border border-gray-200 rounded-lg"
      style={{
        maxWidth: '100%',
        maxHeight: '70vh',
      }}
    >
      <div className="relative">
        <img 
          src={photoUrl} 
          alt="Tool annotation"
          className="max-w-full h-auto"
          onError={(e) => {
            console.error('Image failed to load:', e);
            onError('Failed to load image');
          }}
        />
        <div 
          className="absolute border-2 border-green-500"
          style={{
            left: `${x * 1000}px`,
            top: `${y * 1000}px`,
            width: `${width * 1000}px`,
            height: `${height * 1000}px`,
          }}
        ></div>
      </div>
    </div>
  );
}
