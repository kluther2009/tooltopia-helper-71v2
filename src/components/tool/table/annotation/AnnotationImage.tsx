import { supabase } from "@/integrations/supabase/client";
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
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export function AnnotationImage({ annotation, onLoadingChange, onError }: AnnotationImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      if (!annotation.photo?.file_path) {
        console.log('No photo file path available');
        return;
      }

      onLoadingChange(true);
      onError(null);

      try {
        console.log('Getting public URL for:', annotation.photo.file_path);
        const { data } = supabase.storage
          .from('location-photos')
          .getPublicUrl(annotation.photo.file_path);

        if (data.publicUrl) {
          console.log('Public URL obtained:', data.publicUrl);
          setImageUrl(data.publicUrl);
        }
      } catch (error) {
        console.error('Error getting image URL:', error);
        onError('Failed to load image');
      } finally {
        onLoadingChange(false);
      }
    };

    loadImage();
  }, [annotation.photo?.file_path, onError, onLoadingChange]);

  if (!imageUrl) return null;

  return (
    <div 
      className="relative overflow-hidden border border-gray-200 rounded-lg"
      style={{
        width: `${annotation.coordinates.width}px`,
        height: `${annotation.coordinates.height}px`,
      }}
    >
      <img 
        src={imageUrl} 
        alt="Tool annotation"
        className="absolute max-w-none"
        style={{
          left: `-${annotation.coordinates.x}px`,
          top: `-${annotation.coordinates.y}px`,
        }}
        onError={(e) => {
          console.error('Image failed to load:', e);
          onError('Failed to load image');
        }}
      />
    </div>
  );
}