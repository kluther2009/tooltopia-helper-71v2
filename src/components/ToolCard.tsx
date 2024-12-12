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
  name: string | React.ReactNode;
  location: string;
  status: "available" | "in-use" | "maintenance";
}

export function ToolCard({ id, name, location, status }: ToolCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

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

  const getWrenchColor = () => {
    switch (status) {
      case "available":
        return "#22c55e"; // Green
      case "in-use":
        return "#ef4444"; // Red
      case "maintenance":
        return "#eab308"; // Yellow
      default:
        return "#000000";
    }
  };

  return (
    <Card className="p-2 sm:p-3 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
        <Wrench 
          className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-1" 
          style={{ color: getWrenchColor() }}
        />
        <div className="flex-1 min-w-[120px] pr-2">
          {typeof name === 'string' ? (
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 break-words">
              {name.replace(/[\r\n]+/g, ' ')}
            </h3>
          ) : (
            name
          )}
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
                color: '#64748b',
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
                  Are you sure you want to delete this tool? This action cannot be undone.
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
        </div>
      </div>
    </Card>
  );
}