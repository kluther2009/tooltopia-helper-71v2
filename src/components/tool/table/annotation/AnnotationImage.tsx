
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
  useEffect(() => {
    const loadImage = async () => {
      onLoadingChange(true);
      onError(null);

      try {
        console.log('Using photo URL:', photoUrl);
      } catch (error) {
        console.error('Error getting image URL:', error);
        onError('Failed to load image');
      } finally {
        onLoadingChange(false);
      }
    };

    loadImage();
  }, [photoUrl, onError, onLoadingChange]);

  if (!photoUrl) return null;

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
            left: `${annotation.coordinates.x}px`,
            top: `${annotation.coordinates.y}px`,
            width: `${annotation.coordinates.width}px`,
            height: `${annotation.coordinates.height}px`,
          }}
        ></div>
      </div>
    </div>
  );
}
