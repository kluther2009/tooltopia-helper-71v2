import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface ProjectNotesFieldProps {
  form: UseFormReturn<any>;
}

export function ProjectNotesField({ form }: ProjectNotesFieldProps) {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea 
              {...field} 
              placeholder="Add project notes..." 
              maxLength={350}
            />
          </FormControl>
          <div className="text-xs text-muted-foreground">
            {field.value.length}/350 characters
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}