
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnnotationDialog } from "../tool/table/annotation/AnnotationDialog";

interface PhotoAnnotationOverlayProps {
  photoId: string;
  imageWidth: number;
  imageHeight: number;
}

interface Annotation {
  id: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  tool: {
    id: string;
    name: string;
  };
  photo: {
    file_path: string;
  };
}

export function PhotoAnnotationOverlay({
  photoId,
  imageWidth,
  imageHeight
}: PhotoAnnotationOverlayProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!photoId) return;
    
    const fetchAnnotations = async () => {
      try {
        const { data, error } = await supabase
          .from('tool_annotations')
          .select(`
            id,
            coordinates,
            tool:tools (
              id,
              name
            ),
            photo:location_photos (
              file_path
            )
          `)
          .eq('photo_id', photoId);
          
        if (error) {
          console.error('Error fetching annotations:', error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Found annotations for photo:', data);
          setAnnotations(data as Annotation[]);
        } else {
          console.log('No annotations found for photo');
          setAnnotations([]);
        }
      } catch (error) {
        console.error('Error in fetchAnnotations:', error);
      }
    };
    
    fetchAnnotations();
  }, [photoId]);

  const handleAnnotationClick = (annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsDialogOpen(true);
  };

  return (
    <>
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute cursor-pointer border-2 border-green-500 bg-green-500/10 hover:bg-green-500/20 transition-colors group"
          style={{
            left: `${(annotation.coordinates.x / 1000) * 100}%`,
            top: `${(annotation.coordinates.y / 1000) * 100}%`,
            width: `${(annotation.coordinates.width / 1000) * 100}%`,
            height: `${(annotation.coordinates.height / 1000) * 100}%`
          }}
          onClick={() => handleAnnotationClick(annotation)}
        >
          <div className="absolute -top-6 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {annotation.tool.name}
          </div>
        </div>
      ))}
      
      <AnnotationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        annotation={selectedAnnotation}
      />
    </>
  );
}
