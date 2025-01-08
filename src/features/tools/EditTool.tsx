import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToolSubmission } from './hooks/useToolSubmission';
import { useToolForm } from './hooks/useToolForm';
import { ToolForm } from './components/ToolForm';
import { useToolQuery } from './hooks/useToolQuery';

export const EditTool = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tool, isLoading: isToolLoading } = useToolQuery(id);
  const { updateTool, isLoading: isSubmitting } = useToolSubmission(() => {
    navigate('/tools');
  });

  const form = useToolForm({
    defaultValues: tool,
    onSubmit: (values, annotationData) => {
      updateTool({ tool: { ...values, id }, annotationData });
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
