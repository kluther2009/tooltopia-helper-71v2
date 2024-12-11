import { Card } from "@/components/ui/card";
import { Wrench, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { useEffect, useState } from "react";

interface ToolCardProps {
  id: string;
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance";
}

export function ToolCard({ id, name, location, status }: ToolCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDelete = async () => {
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
      // If unauthorized, redirect to login
      if (error.code === '401') {
        navigate('/login');
      }
      return;
    }

    toast({
      title: "Success",
      description: "Tool deleted successfully",
    });

    // Force a page reload to refresh the tool list
    window.location.reload();
  };

  return (
    <Card className="p-2 sm:p-3 bg-gray-200 border border-black hover:bg-gray-300 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3">
        <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900 shrink-0" />
        <div className="flex-1 break-words pr-2">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900">
            {name.replace(/[\r\n]+/g, ' ')}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/edit-tool/${id}`)}
            className="h-6 w-6 sm:h-8 sm:w-8 min-w-[1.5rem] sm:min-w-[2rem] !p-0 hover:bg-transparent bg-transparent"
          >
            <Pencil 
              className="h-3 w-3 sm:h-4 sm:w-4" 
              style={{ 
                color: '#000000',
                fill: 'none',
                strokeWidth: 2.5
              }} 
            />
          </Button>
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
          <span
            className={`px-2 py-0.5 text-xs sm:text-sm rounded-full whitespace-nowrap ${
              status === "available"
                ? "bg-green-100 text-green-800"
                : status === "in-use"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    </Card>
  );
}