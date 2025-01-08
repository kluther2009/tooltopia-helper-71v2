import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export const UpdateExistingTool = ({ tool, location, subLocation, photoId, coordinates }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // 1. Update tool location
      const { error: toolError } = await supabase
        .from('tools')
        .update({
          location: location,
          sub_location: subLocation
        })
        .eq('id', tool.id);

      if (toolError) throw toolError;

      // 2. Delete old annotation
      await supabase
        .from('annotations')
        .delete()
        .eq('tool_id', tool.id);

      // 3. Create new annotation
      const { error: annotationError } = await supabase
        .from('annotations')
        .insert([
          {
            tool_id: tool.id,
            photo_id: photoId,
            coordinates: coordinates
          }
        ]);

      if (annotationError) throw annotationError;

      toast({
        title: 'Success',
        description: 'Tool location updated successfully'
      });

      navigate('/tools');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tool location',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button 
      onClick={handleUpdate} 
      disabled={isUpdating}
    >
      {isUpdating ? 'Updating...' : 'Update Location'}
    </Button>
  );
};
