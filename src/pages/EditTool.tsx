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

  useEffect(() => {
    const navigationState = location.state as { pendingAnnotation?: any };
    if (navigationState?.pendingAnnotation) {
      console.log('[EditTool] Found annotation data in navigation state:', navigationState.pendingAnnotation);
      localStorage.setItem('pendingAnnotation', JSON.stringify(navigationState.pendingAnnotation));
    }
  }, [location.state]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent, annotationData: any) => {
    e.preventDefault();
    console.log('[EditTool] Starting submission with annotation data:', annotationData);
    
    const success = await updateTool();
    
    if (success && annotationData) {
      console.log('[EditTool] Tool updated, creating annotation');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in to create annotations");
          return;
        }

        const { error: annotationError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: annotationData.photoId,
            tool_id: id,
            coordinates: annotationData.coordinates,
            user_id: user.id
          });

        if (annotationError) {
          console.error('[EditTool] Error creating annotation:', annotationError);
          toast.error('Failed to create tool annotation');
        } else {
          console.log('[EditTool] Annotation created successfully');
          localStorage.removeItem('pendingAnnotation');
        }
      } catch (error) {
        console.error('[EditTool] Error processing annotation:', error);
        toast.error('Failed to create annotation');
      }
    }

    if (success) {
      navigate('/');
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