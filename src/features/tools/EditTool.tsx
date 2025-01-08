import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useToolSubmission } from './hooks/useToolSubmission';
import { ToolForm } from './components/ToolForm';
import { useToolQuery } from './hooks/useToolQuery';

export const EditTool = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const annotationData = location.state?.annotationData;
  const { data: tool, isLoading: isToolLoading } = useToolQuery(id);
  
  const { updateTool, isLoading: isSubmitting } = useToolSubmission(() => {
    navigate('/tools');
  });

  const methods = useForm({
    defaultValues: {
      ...tool,
      location: annotationData?.location || tool?.location,
      sub_location: annotationData?.subLocation || tool?.sub_location,
    }
  });

  const onSubmit = (data) => {
    updateTool({
      tool: { ...data, id },
      annotationData: annotationData ? {
        photoId: annotationData.photoId,
        coordinates: annotationData.coordinates
      } : undefined
    });
  };

  if (isToolLoading) {
    return <div>Loading...</div>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ToolForm 
          form={methods}
          isSubmitting={isSubmitting}
          submitText="Update Tool"
        />
      </form>
    </FormProvider>
  );
};
