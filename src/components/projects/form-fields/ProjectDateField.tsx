import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { UseFormReturn } from "react-hook-form";

interface ProjectDateFieldProps {
  form: UseFormReturn<any>;
}

export function ProjectDateField({ form }: ProjectDateFieldProps) {
  return (
    <FormField
      control={form.control}
      name="target_date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Target Date</FormLabel>
          <FormControl>
            <DatePicker
              date={field.value ? new Date(field.value) : undefined}
              onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}