
import { useState, useEffect, RefObject } from "react"

type Orientation = 'landscape' | 'portrait' | 'square'
type ImageDimensions = { width: number, height: number }

export function useImageDimensions(
  imageRef: RefObject<HTMLImageElement>,
  imageContainerRef: RefObject<HTMLDivElement>
) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState<ImageDimensions>({ width: 0, height: 0 })
  const [orientation, setOrientation] = useState<Orientation>('landscape')

  useEffect(() => {
    if (!imageContainerRef.current || !imageRef.current) return
    
    const updateDisplayDimensions = () => {
      const img = imageRef.current
      if (img && img.complete) {
        setDisplayDimensions({ 
          width: img.clientWidth, 
          height: img.clientHeight 
        })
        
        console.log("Updated display dimensions:", {
          width: img.clientWidth,
          height: img.clientHeight,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          offsetLeft: img.offsetLeft,
          offsetTop: img.offsetTop
        })
      }
    }
    
    const resizeObserver = new ResizeObserver(updateDisplayDimensions)
    resizeObserver.observe(imageContainerRef.current)
    
    updateDisplayDimensions()
    
    window.addEventListener('resize', updateDisplayDimensions)
    
    return () => {
      if (imageContainerRef.current) {
        resizeObserver.unobserve(imageContainerRef.current)
      }
      window.removeEventListener('resize', updateDisplayDimensions)
    }
  }, [loading, imageContainerRef, imageRef])

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      const width = imageRef.current.naturalWidth;
      const height = imageRef.current.naturalHeight;
      
      setImageDimensions({ width, height });
      setDisplayDimensions({ 
        width: imageRef.current.clientWidth, 
        height: imageRef.current.clientHeight 
      });
      
      if (width > height) {
        setOrientation('landscape');
      } else if (height > width) {
        setOrientation('portrait');
      } else {
        setOrientation('square');
      }
      
      setLoading(false);
    }
  }, [imageRef]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight
    const displayWidth = img.width
    const displayHeight = img.height
    
    setImageDimensions({
      width: naturalWidth,
      height: naturalHeight
    })
    setDisplayDimensions({
      width: displayWidth,
      height: displayHeight
    })
    
    if (naturalWidth > naturalHeight) {
      setOrientation('landscape');
    } else if (naturalHeight > naturalWidth) {
      setOrientation('portrait');
    } else {
      setOrientation('square');
    }
    
    setLoading(false)

    console.log('Image loaded - dimensions:', {
      natural: { width: naturalWidth, height: naturalHeight },
      display: { width: displayWidth, height: displayHeight },
      offset: { left: img.offsetLeft, top: img.offsetTop },
      position: { x: img.x, y: img.y },
      orientation: naturalWidth > naturalHeight ? 'landscape' : naturalHeight > naturalWidth ? 'portrait' : 'square',
      scaleFactor: { 
        x: displayWidth / naturalWidth, 
        y: displayHeight / naturalHeight,
      }
    })
  }

  const handleImageError = () => {
    setError('Failed to load image')
    setLoading(false)
  }

  return {
    loading,
    error,
    setError,
    imageDimensions,
    displayDimensions,
    orientation,
    handleImageLoad,
    handleImageError
  }
}
