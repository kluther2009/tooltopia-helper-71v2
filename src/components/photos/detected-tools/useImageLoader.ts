
import { useState, useEffect, useRef, RefObject } from "react";
import { ImageDimensions } from "./types";

interface UseImageLoaderProps {
  imageUrl: string;
  imageContainerRef: RefObject<HTMLDivElement>;
  imageRef: RefObject<HTMLImageElement>;
}

interface UseImageLoaderResult {
  loading: boolean;
  error: string | null;
  imageDimensions: ImageDimensions;
  displayDimensions: ImageDimensions;
  handleImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  handleImageError: () => void;
}

export function useImageLoader({
  imageUrl,
  imageContainerRef,
  imageRef
}: UseImageLoaderProps): UseImageLoaderResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });

  useEffect(() => {
    if (!imageContainerRef.current || !imageRef.current) return;
    
    const updateDisplayDimensions = () => {
      const img = imageRef.current;
      if (img && img.complete) {
        setDisplayDimensions({ 
          width: img.clientWidth, 
          height: img.clientHeight 
        });
        
        console.log("Updated display dimensions:", {
          width: img.clientWidth,
          height: img.clientHeight,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          offsetLeft: img.offsetLeft,
          offsetTop: img.offsetTop
        });
      }
    };
    
    const resizeObserver = new ResizeObserver(updateDisplayDimensions);
    resizeObserver.observe(imageContainerRef.current);
    
    updateDisplayDimensions();
    
    window.addEventListener('resize', updateDisplayDimensions);
    
    return () => {
      if (imageContainerRef.current) {
        resizeObserver.unobserve(imageContainerRef.current);
      }
      window.removeEventListener('resize', updateDisplayDimensions);
    };
  }, [loading]);

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      const width = imageRef.current.naturalWidth;
      const height = imageRef.current.naturalHeight;
      
      setImageDimensions({ width, height });
      setDisplayDimensions({ 
        width: imageRef.current.clientWidth, 
        height: imageRef.current.clientHeight 
      });
      
      setLoading(false);
    }
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayWidth = img.width;
    const displayHeight = img.height;
    
    setImageDimensions({
      width: naturalWidth,
      height: naturalHeight
    });
    setDisplayDimensions({
      width: displayWidth,
      height: displayHeight
    });
    
    setLoading(false);

    console.log('===== IMAGE LOADED =====');
    console.log('Image dimensions:', {
      natural: { width: naturalWidth, height: naturalHeight },
      display: { width: displayWidth, height: displayHeight },
      offset: { left: img.offsetLeft, top: img.offsetTop },
      position: { x: img.x, y: img.y },
      scaleFactor: { 
        x: displayWidth / naturalWidth, 
        y: displayHeight / naturalHeight,
      }
    });
  };

  const handleImageError = () => {
    setError('Failed to load image');
    setLoading(false);
  };

  return {
    loading,
    error,
    imageDimensions,
    displayDimensions,
    handleImageLoad,
    handleImageError
  };
}
