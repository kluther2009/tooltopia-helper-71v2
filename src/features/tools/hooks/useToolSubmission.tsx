import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTool, updateTool } from '../api/toolsApi';
import { createAnnotation, updateAnnotation } from '../api/annotationsApi';
import { Tool } from '../types';

export const useToolSubmission = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const updateToolMutation = useMutation({
    mutationFn: async ({ tool, annotationData }: { tool: Tool; annotationData?: any }) => {
      const updatedTool = await updateTool(tool);
      
      // If we have annotation data, update the annotation as well
      if (annotationData) {
        await updateAnnotation({
          toolId: tool.id,
          photoId: annotationData.photoId,
          coordinates: annotationData.coordinates
        });
      }
      
      return updatedTool;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      onSuccess?.();
    },
  });

  const createToolMutation = useMutation({
    mutationFn: async ({ tool, annotationData }: { tool: Tool; annotationData?: any }) => {
      const newTool = await createTool(tool);
      
      // If we have annotation data, create the annotation
      if (annotationData) {
        await createAnnotation({
          toolId: newTool.id,
          photoId: annotationData.photoId,
          coordinates: annotationData.coordinates
        });
      }
      
      return newTool;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      onSuccess?.();
    },
  });

  return {
    updateTool: updateToolMutation.mutate,
    createTool: createToolMutation.mutate,
    isLoading: updateToolMutation.isPending || createToolMutation.isPending,
  };
};
