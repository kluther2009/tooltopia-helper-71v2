import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/types/projects";
import { ProjectFilter, ProjectSort } from "@/pages/Projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, ArrowRight, Tool, Package2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ProjectMaterials } from "./project-card/ProjectMaterials";
import { ProjectTools } from "./project-card/ProjectTools";

interface ProjectsListProps {
  statusFilter: ProjectFilter;
  sortOrder: ProjectSort;
}

export function ProjectsList({ statusFilter, sortOrder }: ProjectsListProps) {
  const navigate = useNavigate();
  
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects", statusFilter, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select("*");

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      const projectsWithTypedStatus = data.map(project => ({
        ...project,
        status: project.status as "planned" | "ongoing" | "completed"
      }));

      return projectsWithTypedStatus.sort((a, b) => {
        if (!a.target_date && !b.target_date) {
          return sortOrder === "newest" 
            ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;

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

  const statusColors = {
    planned: "bg-blue-600 text-white",
    ongoing: "bg-orange-600 text-white",
    completed: "bg-green-600 text-white",
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="p-4 bg-slate-800 text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <Badge className={statusColors[project.status]} variant="secondary">
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  {project.target_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(project.target_date), "MMM d, yyyy")}
                    </div>
                  )}
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {typeof project.total_cost === 'number' 
                      ? `$${project.total_cost.toFixed(2)}`
                      : '$0.00'
                    }
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Package2 className="h-4 w-4" />
                  <span>Materials:</span>
                </div>
                <ProjectMaterials projectId={project.id} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Tool className="h-4 w-4" />
                  <span>Tools:</span>
                </div>
                <ProjectTools projectId={project.id} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}