import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Project {
  status: string;
}

interface ProjectsOverviewProps {
  projects: Project[];
  toolsInUse: number;
}

const COLORS = ['#60a5fa', '#f97316', '#22c55e'];

export function ProjectsOverview({ projects, toolsInUse }: ProjectsOverviewProps) {
  const activeProjects = projects?.filter(p => p.status === 'ongoing').length || 0;
  
  const projectStatusData = [
    { name: 'Planned', value: projects?.filter(p => p.status === 'planned').length || 0 },
    { name: 'Ongoing', value: projects?.filter(p => p.status === 'ongoing').length || 0 },
    { name: 'Completed', value: projects?.filter(p => p.status === 'completed').length || 0 }
  ];

  return (
    <section className="space-y-6 mt-16">
      <h2 className="text-xl font-semibold">Projects Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tools In Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolsInUse}</div>
          </CardContent>
        </Card>
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