import { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const useToolForm = () => {
  const [state, setState] = useState({
    toolName: '',
    primaryLocation: '',
    subLocation: '',
    specificLocation: '',
    status: 'available',
    showAdditionalInfo: false,
    isUploading: false,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const toolNameInputRef = useRef(null);
  const annotationData = location.state?.annotationData;

  const setToolName = (value: string) => {
    setState(prev => ({ ...prev, toolName: value }));
  };

  const setPrimaryLocation = (value: string) => {
    setState(prev => ({ ...prev, primaryLocation: value }));
  };

  const setSubLocation = (value: string) => {
    setState(prev => ({ ...prev, subLocation: value }));
  };

  const handleExistingToolUpdate = async (toolId: string) => {
    try {
      // 1. Update tool location
      const { error: toolError } = await supabase
        .from('tools')
        .update({
          location: state.primaryLocation,
          sub_location: state.subLocation,
        })
        .eq('id', toolId);

      if (toolError) throw toolError;

      // 2. Remove old annotation
      if (annotationData) {
        await supabase
          .from('annotations')
          .delete()
          .eq('tool_id', toolId);

        // 3. Create new annotation
        const { error: annotationError } = await supabase
          .from('annotations')
          .insert([
            {
              tool_id: toolId,
              photo_id: annotationData.photoId,
              coordinates: annotationData.coordinates
            }
          ]);

        if (annotationError) throw annotationError;
      }

      toast({
        title: 'Success',
        description: 'Tool location updated successfully'
      });

      navigate('/tools');
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tool location',
        variant: 'destructive'
      });
    }
  };

  return {
    formState: state,
    handlers: {
      setToolName,
      setPrimaryLocation,
      setSubLocation,
      handleExistingToolUpdate
    },
    toolNameInputRef
  };
};
