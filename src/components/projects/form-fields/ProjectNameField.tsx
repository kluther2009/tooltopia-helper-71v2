import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface ProjectNameFieldProps {
  form: UseFormReturn<any>;
}

export function ProjectNameField({ form }: ProjectNameFieldProps) {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input 
              {...field} 
              placeholder="Enter project name" 
              maxLength={50}
            />
          </FormControl>
          <div className="text-xs text-muted-foreground">
            {field.value.length}/50 characters
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}