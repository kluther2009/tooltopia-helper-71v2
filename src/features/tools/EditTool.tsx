import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useToolSubmission } from './hooks/useToolSubmission';
import { useToolForm } from './hooks/useToolForm';
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

  const form = useToolForm({
    defaultValues: {
      ...tool,
      location: annotationData?.location || tool?.location,
      sub_location: annotationData?.subLocation || tool?.sub_location,
    },
    onSubmit: (values) => {
      updateTool({
        tool: { ...values, id },
        annotationData: annotationData ? {
          photoId: annotationData.photoId,
          coordinates: annotationData.coordinates
        } : undefined
      });
    },
  });

  if (isToolLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ToolForm
      form={form}
      isSubmitting={isSubmitting}
      submitText="Update Tool"
    />
  );
};
