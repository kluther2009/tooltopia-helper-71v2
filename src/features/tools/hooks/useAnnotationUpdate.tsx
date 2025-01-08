import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useAnnotationUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ toolId, photoId, coordinates }: { 
      toolId: string;
      photoId: string;
      coordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }) => {
      // First, find the existing annotation
      const { data: existing } = await supabase
        .from('annotations')
        .select('*')
        .match({ tool_id: toolId })
        .single();

      if (existing) {
        // Update existing annotation
        const { data, error } = await supabase
          .from('annotations')
          .update({ coordinates })
          .match({ tool_id: toolId })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new annotation if none exists
        const { data, error } = await supabase
          .from('annotations')
          .insert([{
            tool_id: toolId,
            photo_id: photoId,
            coordinates
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
    },
  });
};
