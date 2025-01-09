import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/Layout"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { EditToolForm } from "@/components/tool/EditToolForm"
import { useToolEditor } from "@/hooks/useToolEditor"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useEffect } from "react"

export default function EditTool() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, setState, isLoading, updateTool } = useToolEditor(id);

  // Get tool and annotation data from navigation state
  const { tool: existingTool, annotationData } = location.state || {};

  // Set initial state from navigation
  useEffect(() => {
    if (existingTool) {
      setState({
        toolName: existingTool.name,
        primaryLocation: annotationData?.location || existingTool.location,
        subLocation: annotationData?.subLocation || existingTool.sub_location_a,
        specificLocation: existingTool.sub_location_b,
        status: existingTool.status || 'available',
        showAdditionalInfo: false
      });
    }
  }, [existingTool]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[EditTool] Starting submission with state:', state);
    console.log('[EditTool] Annotation data:', annotationData);
    
    const success = await updateTool(state);
    
    if (success && annotationData) {
      console.log('[EditTool] Tool updated, handling annotation');
      try {
        // First remove any existing annotation
        await supabase
          .from('tool_annotations')
          .delete()
          .eq('tool_id', id);

        // Then create new annotation
        const { error: annotationError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: annotationData.photoId,
            tool_id: id,
            coordinates: annotationData.coordinates,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (annotationError) {
          console.error('[EditTool] Error creating annotation:', annotationError);
          toast.error('Failed to update tool location');
          return;
        }

        console.log('[EditTool] Annotation created successfully');
        localStorage.removeItem('pendingAnnotation');
        toast.success('Tool location updated');
        navigate('/tools');
      } catch (error) {
        console.error('[EditTool] Error processing annotation:', error);
        toast.error('Failed to update tool location');
      }
    } else if (success) {
      toast.success('Tool updated');
      navigate('/tools');
    }
  };

  return (
    <Layout>
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
    </Layout>
  );
}