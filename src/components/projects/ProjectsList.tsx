import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCard } from "./ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/types/projects";
import { ProjectFilter, ProjectSort } from "@/pages/Projects";

interface ProjectsListProps {
  statusFilter: ProjectFilter;
  sortOrder: ProjectSort;
}

export function ProjectsList({ statusFilter, sortOrder }: ProjectsListProps) {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects", statusFilter, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select("*");

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      query = query.order("created_at", { 
        ascending: sortOrder === "oldest" 
      });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(project => ({
        ...project,
        status: project.status as "planned" | "ongoing" | "completed"
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!projects?.length) {
    const filterMessage = statusFilter !== "all" 
      ? `No ${statusFilter} projects found.`
      : "No projects yet. Create your first project to get started!";

    return (
      <div className="text-center py-8 text-muted-foreground">
        {filterMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}