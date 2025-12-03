
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteToolDialogProps {
  id: string;
  name: string;
}

export function DeleteToolDialog({ id, name }: DeleteToolDialogProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to delete tools",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      console.log(`Attempting to delete tool with ID: ${id}`);

      // First, get all annotations for this tool
      const { data: annotations, error: annotationError } = await supabase
        .from('tool_annotations')
        .select('id')
        .eq('tool_id', id);

      if (annotationError) {
        console.error('Error fetching tool annotations:', annotationError);
        throw annotationError;
      }

      console.log(`Found ${annotations?.length || 0} annotations for this tool`);

      // If there are annotations, clean up any temp_annotation_transfers referencing them
      if (annotations && annotations.length > 0) {
        const annotationIds = annotations.map(a => a.id);
        console.log('Annotation IDs to clean up:', annotationIds);

        // Delete any temporary annotation transfers that reference these annotations
        const { error: transferError } = await supabase
          .from('temp_annotation_transfers')
          .delete()
          .in('original_annotation_id', annotationIds);

        if (transferError) {
          console.error('Error deleting temp annotation transfers:', transferError);
          throw transferError;
        }

        console.log('Successfully cleaned up annotation transfers');
      }

      // Now we can safely delete the tool
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error during tool deletion:', error);
        throw error;
      }

      console.log(`Successfully deleted tool with ID: ${id}`);

      toast({
        title: "Success",
        description: "Tool deleted successfully",
      });

      setIsOpen(false);

      // Invalidate the tools query to trigger a refresh in all components using useTools
      queryClient.invalidateQueries({ queryKey: ["tools"] });

    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Error",
        description: "Failed to delete tool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 sm:h-8 sm:w-8 min-w-[1.5rem] sm:min-w-[2rem] !p-0 hover:bg-transparent bg-transparent"
        >
          <Trash2
            className="h-3 w-3 sm:h-4 sm:w-4"
            style={{
              color: '#EF4444',
              fill: 'none',
              strokeWidth: 2.5
            }}
          />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Tool</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {name}? This action cannot be undone and will remove all annotations associated with this tool.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
