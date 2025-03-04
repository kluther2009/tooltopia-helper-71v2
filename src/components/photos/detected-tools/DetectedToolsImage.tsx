
import React, { useRef } from "react";
import { Tool, CoordinateSystem } from "./types";
import { useImageLoader } from "./useImageLoader";
import { convertCoordinates } from "./coordinateUtils";
import { BoundingBox } from "./BoundingBox";
import { toast } from "sonner";

interface DetectedToolsImageProps {
  imageUrl: string;
  detectedTools: Tool[];
  coordinateSystem: CoordinateSystem;
}

export function DetectedToolsImage({ 
  imageUrl, 
  detectedTools, 
  coordinateSystem 
}: DetectedToolsImageProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const {
    loading,
    error,
    imageDimensions,
    displayDimensions,
    handleImageLoad,
    handleImageError
  } = useImageLoader({
    imageUrl,
    imageContainerRef,
    imageRef
  });

  if (error) {
    toast.error('Failed to load image');
    return (
      <div className="text-red-500 mb-4">
        <p>{error}</p>
        <p className="text-xs break-all mt-1">URL: {imageUrl}</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full flex justify-center" 
      ref={imageContainerRef}
    >
      <div className="relative inline-block">
        <img 
          id="detected-image"
          ref={imageRef}
          src={imageUrl}
          alt="Tool detection"
          className="rounded-lg shadow-sm max-w-full h-auto object-contain"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {!loading && detectedTools.length > 0 && (
          <div className="absolute inset-0">
            {/* Single log when rendering tools */}
            {(() => {
              console.log('===== DETECTED TOOLS RENDERING =====', {
                toolsCount: detectedTools.length,
                coordinateSystem,
                dimensions: {
                  image: imageDimensions,
                  display: displayDimensions
                }
              });
              return null;
            })()}
            {detectedTools.map((tool, index) => {
              if (!tool.box_2d || tool.box_2d.length !== 4) {
                console.error('Invalid bounding box format for tool:', tool);
                return null;
              }
              
              const coords = convertCoordinates(
                tool.box_2d,
                imageDimensions,
                displayDimensions,
                coordinateSystem
              );
              
              return (
                <BoundingBox 
                  key={index}
                  tool={tool}
                  coords={coords}
                  index={index}
                />
              );
            })}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}
      </div>
    </div>
  );
}
