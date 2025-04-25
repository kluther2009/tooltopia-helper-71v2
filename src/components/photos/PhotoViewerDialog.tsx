
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LocationPhoto } from "@/types/photos";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { AnnotationCanvas } from "./canvas/AnnotationCanvas";
import { toast } from "sonner";
import { Annotation } from "./canvas/types";

interface PhotoViewerDialogProps {
  photo: LocationPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelect?: (photo: LocationPhoto) => void;
  selectionMode?: boolean;
}

export function PhotoViewerDialog({ 
  photo, 
  isOpen, 
  onClose,
  onPhotoSelect,
  selectionMode = false 
}: PhotoViewerDialogProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait' | 'square' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (photo?.id && isOpen) {
      fetchAnnotations();
    } else {
      setAnnotations([]);
    }
  }, [photo?.id, isOpen]);

  const fetchAnnotations = async () => {
    if (!photo?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tool_annotations')
        .select(`
          id,
          coordinates,
          tool_id,
          moved,
          tool:tools (
            id,
            name
          )
        `)
        .eq('photo_id', photo.id);

      if (error) {
        throw error;
      }

      console.log('Raw annotation data:', data);
      
      // Transform data to ensure proper format for display
      const transformedData = data?.map(annotation => {
        // Get the raw coordinates
        const rawCoordinates = annotation.coordinates;
        let formattedCoordinates;
        
        if (rawCoordinates && typeof rawCoordinates === 'object') {
          // Check if coordinates is an object with x, y, width, height properties
          if ('x' in rawCoordinates && 
              'y' in rawCoordinates && 
              'width' in rawCoordinates && 
              'height' in rawCoordinates) {
            
            formattedCoordinates = {
              x: typeof rawCoordinates.x === 'number' ? rawCoordinates.x : 0,
              y: typeof rawCoordinates.y === 'number' ? rawCoordinates.y : 0,
              width: typeof rawCoordinates.width === 'number' ? rawCoordinates.width : 0,
              height: typeof rawCoordinates.height === 'number' ? rawCoordinates.height : 0
            };
          } else {
            // Handle case where coordinates might have a different structure
            console.error('Coordinates object does not have expected properties:', rawCoordinates);
            formattedCoordinates = { x: 0, y: 0, width: 0, height: 0 };
          }
        } else {
          // If no coordinates, provide defaults
          formattedCoordinates = { x: 0, y: 0, width: 0, height: 0 };
          console.error('Missing or invalid coordinates for annotation:', annotation.id);
        }
        
        return {
          id: annotation.id,
          coordinates: formattedCoordinates,
          tool_id: annotation.tool_id,
          moved: annotation.moved || false,
          tool: annotation.tool || { id: annotation.tool_id || '', name: 'Unknown Tool' }
        } as Annotation;
      }) || [];
      
      console.log('Transformed annotations:', transformedData);
      setAnnotations(transformedData);
    } catch (error) {
      console.error('Error fetching annotations:', error);
      toast.error('Failed to load tool annotations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    
    if (width > height) {
      setOrientation('landscape');
    } else if (height > width) {
      setOrientation('portrait');
    } else {
      setOrientation('square');
    }
  };

  if (!photo && !selectionMode) return null;

  const handlePhotoClick = () => {
    if (selectionMode && photo && onPhotoSelect) {
      onPhotoSelect(photo);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {photo?.location || "Select a Photo"}
            {orientation && <span className="ml-2 text-sm text-gray-500">({orientation})</span>}
          </DialogTitle>
          <DialogDescription>
            {annotations.length > 0 ? `Showing ${annotations.length} tool annotations` : "No tool annotations found for this photo"}
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video" onClick={handlePhotoClick}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) : photo ? (
            <AnnotationCanvas
              imageUrl={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
              existingAnnotations={annotations}
              onImageLoad={handleImageLoad}
            />
          ) : null}
        </div>
        {photo && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">{photo.location}</h3>
            <p className="text-sm text-gray-500">
              Uploaded on: {new Date(photo.created_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
