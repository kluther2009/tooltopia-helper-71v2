
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Annotation {
  id: string;
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

export function useToolAnnotation(toolId: string) {
  const [hasAnnotation, setHasAnnotation] = useState(false);
  const [annotationData, setAnnotationData] = useState<Annotation | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);

  useEffect(() => {
    checkForAnnotations();
  }, [toolId]);

  const checkForAnnotations = async () => {
    try {
      console.log('Fetching annotations for tool:', toolId);
      const { data, error } = await supabase
        .from('tool_annotations')
        .select(`
          id,
          coordinates,
          photo:location_photos (
            file_path
          )
        `)
        .eq('tool_id', toolId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching annotations:', error);
        return;
      }

      if (data && data.photo) {
        console.log('Found annotation:', data);
        setHasAnnotation(true);
        setAnnotationData(data as Annotation);
      } else {
        console.log('No annotation found');
        setHasAnnotation(false);
        setAnnotationData(null);
      }
    } catch (error) {
      console.error('Error in checkForAnnotations:', error);
    }
  };

  return {
    hasAnnotation,
    annotationData,
    isAnnotationDialogOpen,
    setIsAnnotationDialogOpen
  };
}
