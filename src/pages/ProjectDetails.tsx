import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetails() {
  const { id } = useParams();
  console.log("Project ID from params:", id); // Debug log

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) throw new Error("Project ID is required");
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) {
        console.error("Error fetching project:", error);
        throw error;
      }
      
      if (!data) throw new Error("Project not found");
      
      return data;
    },
    enabled: !!id, // Only run query when ID is available
  });

  if (isLoading) {
    return (
      <div className="container py-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold text-red-600">Project not found</h1>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">{project.name}</h1>
      
      <div className="grid gap-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Status</h2>
          <p className="text-muted-foreground">{project.status}</p>
        </div>
        
        {project.notes && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Notes</h2>
            <p className="text-muted-foreground">{project.notes}</p>
          </div>
        )}
        
        {project.target_date && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Target Date</h2>
            <p className="text-muted-foreground">
              {new Date(project.target_date).toLocaleDateString()}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Total Cost</h2>
          <p className="text-muted-foreground">
            ${project.total_cost?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>
    </div>
  );
}