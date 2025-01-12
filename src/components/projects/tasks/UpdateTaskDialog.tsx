import * as React from "react";
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
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateTaskDialogProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    due_date: string | null;
    materials_used: string[];
    tools_used: string[];
  } | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateTaskDialog({ task, projectId, open, onOpenChange }: UpdateTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "pending",
      due_date: task?.due_date || "",
      materials_used: task?.materials_used || [],
      tools_used: task?.tools_used || [],
    },
  });

  // Update form values when task changes
  React.useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        due_date: task.due_date || "",
        materials_used: task.materials_used || [],
        tools_used: task.tools_used || [],
      });
    }
  }, [task, form]);

  const onSubmit = async (values: any) => {
    if (!task) return;
    
    const title = values.title.trim();
    const description = values.description.trim();

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
        .update({
          title: title,
          description: description || null,
          status: values.status,
          due_date: values.due_date || null,
          materials_used: values.materials_used,
          tools_used: values.tools_used,
        })
        .eq("id", task.id);

      if (error) throw error;

      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
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
              {isSubmitting ? "Updating..." : "Update Task"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}