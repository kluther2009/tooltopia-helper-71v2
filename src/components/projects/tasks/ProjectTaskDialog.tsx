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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project } from "@/types/projects";

interface ProjectTaskDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectTaskDialog({ project, open, onOpenChange }: ProjectTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      due_date: "",
      materials_used: [],
      tools_used: [],
    },
  });

  const onSubmit = async (values: any) => {
    const title = values.title.trim();
    const description = values.description.trim();

    if (!title) {
      toast.error("Please enter a task title");
      return;
    }

    if (title.length > 50) {
      toast.error("Task title cannot exceed 50 characters");
      return;
    }

    if (description.length > 350) {
      toast.error("Task description cannot exceed 350 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("project_tasks")
        .insert({
          project_id: project.id,
          title: title,
          description: description || null,
          due_date: values.due_date || null,
          materials_used: values.materials_used,
          tools_used: values.tools_used,
        });

      if (error) throw error;

      toast.success("Task added successfully");
      queryClient.invalidateQueries({ queryKey: ["project-tasks", project.id] });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}