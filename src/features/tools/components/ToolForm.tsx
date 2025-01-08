import React from 'react';
import { Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';

interface ToolFormProps {
  form: UseFormReturn<any>;
  isSubmitting?: boolean;
  submitText?: string;
}

export const ToolForm: React.FC<ToolFormProps> = ({
  form,
  isSubmitting,
  submitText = 'Submit'
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(form.onSubmit)} className="space-y-4">
        {/* Your form fields here */}
        <div className="flex justify-end space-x-2">
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
};
