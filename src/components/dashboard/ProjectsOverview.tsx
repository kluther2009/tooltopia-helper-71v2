import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectMetricCard } from "./metrics/ProjectMetricCard";
import { ProjectStatusChart } from "./charts/ProjectStatusChart";

interface Project {
  status: string;
  total_cost?: number;
  id: string;
}

interface ProjectsOverviewProps {
  projects: Project[];
  toolsInUse: number;
}

interface ProjectMetrics {
  count: number;
  totalCost: number;
  toolsCount: number;
  tasksCount: number;
  materialsCount: number;
}

export function ProjectsOverview({ projects, toolsInUse }: ProjectsOverviewProps) {
  // Query to get project tools count
  const { data: projectTools } = useQuery({
    queryKey: ["project-tools-count"],
    queryFn: async () => {
      if (!projects?.length) return [];
      
      const { data, error } = await supabase
        .from("project_tools")
        .select("project_id")
        .in('project_id', projects.map(p => p.id));
        
      if (error) {
        console.error('Error fetching project tools:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!projects?.length
  });

  // Query to get project tasks count
  const { data: projectTasks } = useQuery({
    queryKey: ["project-tasks-count"],
    queryFn: async () => {
      if (!projects?.length) return [];

      const { data, error } = await supabase
        .from("project_tasks")
        .select("project_id")
        .in('project_id', projects.map(p => p.id));
        
      if (error) {
        console.error('Error fetching project tasks:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!projects?.length
  });

  // Query to get project materials count
  const { data: projectMaterials } = useQuery({
    queryKey: ["project-materials-count"],
    queryFn: async () => {
      if (!projects?.length) return [];

      const { data, error } = await supabase
        .from("project_materials")
        .select("project_id")
        .in('project_id', projects.map(p => p.id));
        
      if (error) {
        console.error('Error fetching project materials:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!projects?.length
  });

  const calculateMetrics = (projectList: Project[]): ProjectMetrics => {
    return {
      count: projectList.length,
      totalCost: projectList.reduce((sum, p) => sum + (p.total_cost || 0), 0),
      toolsCount: projectTools?.filter(t => 
        projectList.some(p => p.id === t.project_id)
      ).length || 0,
      tasksCount: projectTasks?.filter(t => 
        projectList.some(p => p.id === t.project_id)
      ).length || 0,
      materialsCount: projectMaterials?.filter(m => 
        projectList.some(p => p.id === m.project_id)
      ).length || 0,
    };
  };

  const allProjectsMetrics = calculateMetrics(projects);
  const plannedProjectsMetrics = calculateMetrics(projects.filter(p => p.status === 'planned'));
  const ongoingProjectsMetrics = calculateMetrics(projects.filter(p => p.status === 'ongoing'));
  const completedProjectsMetrics = calculateMetrics(projects.filter(p => p.status === 'completed'));
  
  const projectStatusData = [
    { name: 'Planned', value: projects?.filter(p => p.status === 'planned').length || 0 },
    { name: 'Ongoing', value: projects?.filter(p => p.status === 'ongoing').length || 0 },
    { name: 'Completed', value: projects?.filter(p => p.status === 'completed').length || 0 }
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold mb-6">Projects Overview</h2>
      
      <div className="grid gap-6 mb-6">
        <ProjectMetricCard title="All Projects" metrics={allProjectsMetrics} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProjectMetricCard title="Planned Projects" metrics={plannedProjectsMetrics} />
          <ProjectMetricCard title="Ongoing Projects" metrics={ongoingProjectsMetrics} />
          <ProjectMetricCard title="Completed Projects" metrics={completedProjectsMetrics} />
        </div>
      </div>

      <ProjectStatusChart data={projectStatusData} />
    </section>
  );
}