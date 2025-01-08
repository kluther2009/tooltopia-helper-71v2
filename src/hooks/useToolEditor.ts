import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface ToolState {
  name: string;
  location: string;
  sub_location?: string;
  specific_location?: string;
  status: string;
  annotationData?: any;
}

export const useToolEditor = (id: string | undefined) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<ToolState>({
    name: '',
    location: '',
    sub_location: '',
    specific_location: '',
    status: 'available',
    annotationData: location.state?.annotationData
  });

  useEffect(() => {
    const fetchTool = async () => {
      if (!id) return;

      const { data: tool, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch tool details',
          variant: 'destructive',
        });
        return;
      }

      // If we have annotation data, use its location/sub_location
      const annotationData = location.state?.annotationData;
      setState({
        ...tool,
        location: annotationData?.location || tool.location,
        sub_location: annotationData?.subLocation || tool.sub_location,
        annotationData: annotationData
      });
      setIsLoading(false);
    };

    fetchTool();
  }, [id, location.state?.annotationData]);

  const updateTool = async () => {
    if (!id) return;

    // First update the tool
    const { error: toolError } = await supabase
      .from('tools')
      .update({
        name: state.name,
        location: state.location,
        sub_location: state.sub_location,
        specific_location: state.specific_location,
        status: state.status,
      })
      .eq('id', id);

    if (toolError) {
      toast({
        title: 'Error',
        description: 'Failed to update tool',
        variant: 'destructive',
      });
      return;
    }

    // If we have annotation data, update the annotation
    if (state.annotationData) {
      // First remove any existing annotation
      await supabase
        .from('annotations')
        .delete()
        .match({ tool_id: id });

      // Then create new annotation
      const { error: annotationError } = await supabase
        .from('annotations')
        .insert([
          {
            tool_id: id,
            photo_id: state.annotationData.photoId,
            coordinates: state.annotationData.coordinates
          }
        ]);

      if (annotationError) {
        toast({
          title: 'Warning',
          description: 'Tool updated but failed to update annotation',
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: 'Success',
      description: 'Tool updated successfully',
    });

    navigate('/tools');
  };

  return { state, setState, isLoading, updateTool };
};
