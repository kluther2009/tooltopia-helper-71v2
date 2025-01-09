import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/Layout"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { EditToolForm } from "@/components/tool/EditToolForm"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export default function EditTool() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState({
    toolName: '',
    primaryLocation: '',
    subLocation: '',
    specificLocation: '',
    status: 'available',
    showAdditionalInfo: false
  });

  // Load tool data
  useEffect(() => {
    const loadTool = async () => {
      try {
        const { data: tool, error } = await supabase
          .from('tools')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Get annotation data if it exists
        const annotationData = location.state?.annotationData;

        setState({
          toolName: tool.name,
          primaryLocation: annotationData?.location || tool.location,
          subLocation: annotationData?.subLocation || tool.sub_location_a,
          specificLocation: tool.sub_location_b,
          status: tool.status || 'available',
          showAdditionalInfo: false
        });
      } catch (error) {
        console.error('Error loading tool:', error);
        toast.error('Failed to load tool details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadTool();
  }, [id, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const annotationData = location.state?.annotationData;

    try {
      // Update tool first
      const { error: toolError } = await supabase
        .from('tools')
        .update({
          name: state.toolName,
          location: state.primaryLocation,
          sub_location_a: state.subLocation,
          sub_location_b: state.specificLocation,
          status: state.status
        })
        .eq('id', id);

      if (toolError) throw toolError;

      // If we have annotation data, handle that
      if (annotationData) {
        // Remove old annotation
        await supabase
          .from('tool_annotations')
          .delete()
          .eq('tool_id', id);

        // Create new annotation
        const { error: annotationError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: annotationData.photoId,
            tool_id: id,
            coordinates: annotationData.coordinates,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (annotationError) throw annotationError;

        localStorage.removeItem('pendingAnnotation');
      }

      toast.success('Tool updated successfully');
      navigate('/tools');
    } catch (error) {
      console.error('Error updating tool:', error);
      toast.error('Failed to update tool');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </Layout>
    );
  }

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