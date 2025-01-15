import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectNameField } from "./form-fields/ProjectNameField";
import { ProjectStatusField } from "./form-fields/ProjectStatusField";
import { ProjectDateField } from "./form-fields/ProjectDateField";
import { ProjectNotesField } from "./form-fields/ProjectNotesField";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      status: "planned",
      notes: "",
      target_date: "",
    },
  });

  const onSubmit = async (values: any) => {
    const name = values.name.trim();
    const notes = values.notes.trim();

    if (!name) {
      toast.error("Please enter a project name");
      return;
    }

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("projects")
        .insert({
          name: name,
          status: values.status,
          notes: notes || null,
          target_date: values.target_date || null,
          user_id: user.id
        });

      if (error) throw error;

      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ProjectNameField form={form} />
            <ProjectStatusField form={form} />
            <ProjectDateField form={form} />
            <ProjectNotesField form={form} />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}