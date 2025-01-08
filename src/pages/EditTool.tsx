import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/Layout"
import { useParams, useLocation } from "react-router-dom"
import { EditToolForm } from "@/components/tool/EditToolForm"
import { useToolEditor } from "@/hooks/useToolEditor"
import { FormProvider, useForm } from "react-hook-form"

export default function EditTool() {
  const { id } = useParams();
  const location = useLocation();
  const { state, setState, isLoading, updateTool } = useToolEditor(id);

  // Create form methods
  const formMethods = useForm({
    defaultValues: state
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateTool();
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...formMethods}>
              <EditToolForm
                state={state}
                onStateChange={(newState) => setState(prev => ({ ...prev, ...newState }))}
                onSubmit={handleSubmit}
              />
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}