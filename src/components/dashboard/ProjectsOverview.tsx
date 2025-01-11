import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

const COLORS = ['#60a5fa', '#f97316', '#22c55e'];

export function ProjectsOverview({ projects, toolsInUse }: ProjectsOverviewProps) {
  // Query to get project tools count
  const { data: projectTools } = useQuery({
    queryKey: ["project-tools-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tools")
        .select("project_id");
      if (error) throw error;
      return data;
    },
  });

  // Query to get project tasks count
  const { data: projectTasks } = useQuery({
    queryKey: ["project-tasks-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tasks")
        .select("project_id");
      if (error) throw error;
      return data;
    },
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

  const MetricCard = ({ title, metrics }: { title: string, metrics: ProjectMetrics }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Count</p>
            <p className="text-2xl font-bold">{metrics.count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-bold">${metrics.totalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tools</p>
            <p className="text-2xl font-bold">{metrics.toolsCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tasks</p>
            <p className="text-2xl font-bold">{metrics.tasksCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section>
      <h2 className="text-xl font-semibold mb-6">Projects Overview</h2>
      
      <div className="grid gap-6 mb-6">
        <MetricCard title="All Projects" metrics={allProjectsMetrics} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Planned Projects" metrics={plannedProjectsMetrics} />
          <MetricCard title="Ongoing Projects" metrics={ongoingProjectsMetrics} />
          <MetricCard title="Completed Projects" metrics={completedProjectsMetrics} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}