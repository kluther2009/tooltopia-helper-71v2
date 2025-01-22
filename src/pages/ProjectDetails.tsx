import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Project } from "@/types/projects";
import { toast } from "sonner";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) {
        console.error("No project ID provided");
        throw new Error("Project ID is required");
      }

      console.log("Attempting to fetch project with ID:", projectId);
      
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            project_materials (*),
            project_tools (
              *,
              tool:tools (*)
            )
          `)
          .eq("id", projectId)
          .maybeSingle();

        if (error) {
          console.error("Supabase error fetching project:", error);
          throw error;
        }
        
        if (!data) {
          console.error("No project found with ID:", projectId);
          throw new Error("Project not found");
        }

        console.log("Successfully fetched project:", data);
        
        // Cast the status to ensure it matches the Project type
        return {
          ...data,
          status: data.status as "planned" | "ongoing" | "completed"
        } as Project;
      } catch (error) {
        console.error("Error in project fetch:", error);
        throw error;
      }
    },
    enabled: !!projectId,
  });

  if (isError) {
    console.error("Project query error state triggered");
    toast.error("Failed to load project");
    return (
      <div className="max-w-[1200px] mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <div className="flex items-center justify-center p-8 bg-slate-800 rounded-lg">
          <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
          <span className="text-white">Failed to load project. Please try again.</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-700 rounded mb-4"></div>
          <div className="h-[400px] bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <div className="flex items-center justify-center p-8 bg-slate-800 rounded-lg">
          <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
          <span className="text-white">Project not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <h1 className="text-2xl font-bold text-white">{project.name}</h1>
      </div>
      <ProjectCard project={project} />
    </div>
  );
}