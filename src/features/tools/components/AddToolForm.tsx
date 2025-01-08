import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToolSubmission } from '../hooks/useToolSubmission';
import { useToolForm } from '../hooks/useToolForm';
import { ToolForm } from './ToolForm';
import { Tool } from '../types';

export const AddToolForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const annotationData = location.state?.annotationData;

  const { createTool, updateTool, isLoading } = useToolSubmission(() => {
    navigate('/tools');
  });

  const handleSubmit = async (values: Tool, existingTool?: Tool) => {
    if (existingTool) {
      await updateTool({ 
        tool: { ...values, id: existingTool.id },
        annotationData: annotationData
      });
    } else {
      await createTool({ 
        tool: values,
        annotationData: annotationData
      });
    }
  };

  const form = useToolForm({
    defaultValues: {
      location: annotationData?.location || '',
      sub_location: annotationData?.subLocation || '',
    },
    onSubmit: handleSubmit,
  });

  return (
    <ToolForm
      form={form}
      isSubmitting={isLoading}
      submitText="Add Tool"
    />
  );
};
