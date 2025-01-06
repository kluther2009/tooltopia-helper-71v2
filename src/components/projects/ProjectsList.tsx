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

      // First get all projects without sorting
      const { data, error } = await query;
      
      if (error) throw error;
      
      const projectsWithTypedStatus = data.map(project => ({
        ...project,
        status: project.status as "planned" | "ongoing" | "completed"
      }));

      // Sort projects based on target_date
      return projectsWithTypedStatus.sort((a, b) => {
        // Handle cases where target_date is null
        if (!a.target_date && !b.target_date) {
          // If both don't have target dates, sort by created_at
          return sortOrder === "newest" 
            ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        
        // Projects without target_date go to the end
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;

        // Sort by target_date
        const dateA = new Date(a.target_date).getTime();
        const dateB = new Date(b.target_date).getTime();
        
        return sortOrder === "newest" 
          ? dateB - dateA 
          : dateA - dateB;
      });
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