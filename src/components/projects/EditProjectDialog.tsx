import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project } from "@/types/projects";

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: project.name,
      status: project.status,
      notes: project.notes || "",
      target_date: project.target_date || "",
    },
  });

  const onSubmit = async (values: any) => {
    const name = values.name.trim();
    const notes = values.notes.trim();

    if (name.length > 50) {
      toast.error("Project name cannot exceed 50 characters");
      return;
    }

    if (notes.length > 350) {
      toast.error("Project notes cannot exceed 350 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: name,
          status: values.status,
          notes: notes || null,
          target_date: values.target_date || null,
        })
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Project updated successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={50} />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    {field.value.length}/50 characters
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} maxLength={350} />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    {field.value.length}/350 characters
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}