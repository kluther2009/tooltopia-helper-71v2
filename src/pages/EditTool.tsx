import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/Layout"
import { useParams } from "react-router-dom"
import { EditToolForm } from "@/components/tool/EditToolForm"
import { useToolEditor } from "@/hooks/useToolEditor"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export default function EditTool() {
  const { id } = useParams();
  const { state, setState, isLoading, updateTool } = useToolEditor(id);

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
    
    // First update the tool
    const success = await updateTool();
    
    if (success && annotationData) {
      console.log('[EditTool] Creating annotation with data:', annotationData);
      
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
          console.error('Error creating annotation:', annotationError);
          toast.error('Failed to create tool annotation');
          return;
        }

        console.log('[EditTool] Annotation created successfully');
        localStorage.removeItem('pendingAnnotation');
        toast.success('Tool and annotation updated successfully');
      } catch (error) {
        console.error('Error processing annotation:', error);
        toast.error('Failed to create annotation');
      }
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