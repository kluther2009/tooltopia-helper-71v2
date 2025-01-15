import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project } from "@/types/projects";
import { ProjectNameField } from "./form-fields/ProjectNameField";
import { ProjectStatusField } from "./form-fields/ProjectStatusField";
import { ProjectDateField } from "./form-fields/ProjectDateField";
import { ProjectNotesField } from "./form-fields/ProjectNotesField";

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
            <ProjectNameField form={form} />
            <ProjectStatusField form={form} />
            <ProjectDateField form={form} />
            <ProjectNotesField form={form} />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}