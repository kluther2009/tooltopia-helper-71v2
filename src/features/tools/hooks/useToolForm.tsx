import { useForm } from 'react-hook-form';
import { Tool } from '../types';
import { useLocation } from 'react-router-dom';

interface UseToolFormProps {
  defaultValues?: Partial<Tool>;
  onSubmit: (values: Tool, annotationData?: any) => void;
}

export const useToolForm = ({ defaultValues, onSubmit }: UseToolFormProps) => {
  const location = useLocation();
  const form = useForm({
    defaultValues: {
      name: '',
      location: '',
      sub_location: '',
      specific_location: '',
      status: 'available',
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values, location.state?.annotationData);
  });

  return {
    ...form,
    onSubmit: handleSubmit,
  };
};
