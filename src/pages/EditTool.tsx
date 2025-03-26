
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
  const { state, setState, isLoading, updateTool, isToolLoaded } = useToolEditor(id);
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
          
          if (isToolLoaded) {
            console.log('[EditTool] Updating locations from temporary annotation');
            setState(prev => ({
              ...prev,
              primaryLocation: tempAnnotation.location || prev.primaryLocation,
              subLocation: tempAnnotation.sub_location || prev.subLocation
            }));
          }
        } else {
          console.log('[EditTool] No temporary annotation found');
        }
      } catch (error) {
        console.error('[EditTool] Error fetching temporary annotation:', error);
      }
    };

    fetchTemporaryAnnotation();
  }, [setState, isToolLoaded]);

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
    
    const success = await updateTool(state, annotationData);
    
    if (success && annotationData) {
      console.log('[EditTool] Tool updated, handling annotation');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in to create annotations");
          return;
        }

        // Mark existing annotations for this tool as moved BEFORE creating the new one
        console.log('[EditTool] Marking existing annotations as moved');
        const { error: updateError } = await supabase
          .from('tool_annotations')
          .update({ moved: true })
          .eq('tool_id', id);

        if (updateError) {
          console.error('[EditTool] Error updating existing annotations:', updateError);
          toast.error('Failed to update existing annotations');
          return;
        }

        // Create new annotation
        console.log('[EditTool] Creating new annotation');
        const { error: insertError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: annotationData.photo_id,
            tool_id: id,
            coordinates: annotationData.coordinates,
            user_id: user.id,
            moved: false
          });

        if (insertError) {
          console.error('[EditTool] Error creating annotation:', insertError);
          toast.error('Failed to create tool annotation');
          return;
        }

        console.log('[EditTool] Successfully created new annotation');
        
        // Clean up temporary annotation
        const { error: deleteError } = await supabase
          .from('temporary_annotations')
          .delete()
          .eq('id', annotationData.id);

        if (deleteError) {
          console.error('[EditTool] Error deleting temporary annotation:', deleteError);
        }

        toast.success('Tool and annotation updated successfully');
      } catch (error) {
        console.error('[EditTool] Error processing annotation:', error);
        toast.error('Failed to create annotation');
      }
    }

    if (success) {
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
