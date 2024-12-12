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
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteToolDialogProps {
  id: string;
  name: string;
}

export function DeleteToolDialog({ id, name }: DeleteToolDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async () => {
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

    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete tool",
        variant: "destructive",
      });
      if (error.code === '401') {
        navigate('/login');
      }
      return;
    }

    toast({
      title: "Success",
      description: "Tool deleted successfully",
    });

    window.location.reload();
  };

  return (
    <AlertDialog>
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
            Are you sure you want to delete {name}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}