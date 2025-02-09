
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { EditToolForm } from "@/components/tool/EditToolForm"
import { useToolEditor } from "@/hooks/useToolEditor"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export default function EditTool() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, setState, isLoading, updateTool } = useToolEditor(id);
  const [annotationData, setAnnotationData] = useState<any>(null);

  useEffect(() => {
    const fetchTemporaryAnnotation = async () => {
      try {
        console.log('[EditTool] Fetching temporary annotation...');
        const { data: tempAnnotation, error } = await supabase
          .from('temporary_annotations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('[EditTool] Error fetching temporary annotation:', error);
          return;
        }

        if (tempAnnotation) {
          console.log('[EditTool] Found temporary annotation:', tempAnnotation);
          setAnnotationData(tempAnnotation);
          
          setState(prev => ({
            ...prev,
            primaryLocation: tempAnnotation.location || prev.primaryLocation,
            subLocation: tempAnnotation.sub_location || prev.subLocation
          }));
        } else {
          console.log('[EditTool] No temporary annotation found');
        }
      } catch (error) {
        console.error('[EditTool] Error fetching temporary annotation:', error);
      }
    };

    fetchTemporaryAnnotation();
  }, [setState]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[EditTool] Starting submission with annotation data:', annotationData);
    
    const success = await updateTool();
    
    if (success && annotationData) {
      console.log('[EditTool] Tool updated, handling annotation');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in to create annotations");
          return;
        }

        // First, fetch the current tool's annotation to check if it's being moved
        const { data: currentAnnotation, error: fetchError } = await supabase
          .from('tool_annotations')
          .select('photo_id')
          .eq('tool_id', id)
          .maybeSingle();

        if (fetchError) {
          console.error('[EditTool] Error fetching current annotation:', fetchError);
        }

        console.log('[EditTool] Current annotation:', currentAnnotation);
        console.log('[EditTool] New annotation data:', annotationData);

        // If the photo_id is different, mark the old annotation as moved
        if (currentAnnotation && currentAnnotation.photo_id !== annotationData.photo_id) {
          console.log('[EditTool] Tool is being moved to a new photo');
          const { error: updateError } = await supabase
            .from('tool_annotations')
            .update({ moved: true })
            .eq('tool_id', id)
            .eq('photo_id', currentAnnotation.photo_id);

          if (updateError) {
            console.error('[EditTool] Error updating old annotation:', updateError);
          }
        }

        // Delete any other annotations for this tool
        const { error: deleteError } = await supabase
          .from('tool_annotations')
          .delete()
          .eq('tool_id', id);

        if (deleteError) {
          console.error('[EditTool] Error deleting existing annotations:', deleteError);
          toast.error('Failed to update tool annotation');
          return;
        }

        console.log('[EditTool] Deleted existing annotations for tool');

        // Create new annotation
        const { error: insertError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: annotationData.photo_id,
            tool_id: id,
            coordinates: annotationData.coordinates,
            user_id: user.id,
            moved: false // New annotation is not moved
          });

        if (insertError) {
          console.error('[EditTool] Error creating annotation:', insertError);
          toast.error('Failed to create tool annotation');
          return;
        }

        console.log('[EditTool] Successfully created new annotation');
        
        // Clean up temporary annotation
        const { error: deleteError2 } = await supabase
          .from('temporary_annotations')
          .delete()
          .eq('id', annotationData.id);

        if (deleteError2) {
          console.error('[EditTool] Error deleting temporary annotation:', deleteError2);
        }

        toast.success('Tool and annotation updated successfully');
      } catch (error) {
        console.error('[EditTool] Error processing annotation:', error);
        toast.error('Failed to create annotation');
      }
    }

    if (success) {
      // Navigate back to the previous page using location state
      const previousPath = location.state?.from || '/tool-overview';
      navigate(previousPath);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <EditToolForm
            state={state}
            onStateChange={(newState) => setState(prev => ({ ...prev, ...newState }))}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
