import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ArrowLeft } from "lucide-react";
import { Project } from "@/types/projects";
import { ScrapbookGrid } from "@/components/scrapbook/ScrapbookGrid";
import { AddScrapbookItemDialog } from "@/components/scrapbook/AddScrapbookItemDialog";
import { BrainSearchBar } from "@/components/scrapbook/BrainSearchBar";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Project not found");

      // Cast the status to ensure it matches the Project type
      return {
        ...data,
        status: data.status as "planned" | "ongoing" | "completed"
      } as Project;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
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
        <h1 className="text-2xl font-bold text-white mb-2">{project.name}</h1>
      </div>

      <div className="space-y-8">
        <ProjectCard project={project} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Project Scrapbook</h2>
          </div>

          <BrainSearchBar projectId={project.id} />

          <ScrapbookGrid projectId={project.id} />
        </div>
      </div>

      <AddScrapbookItemDialog projectId={project.id} />
    </div>
  );
}