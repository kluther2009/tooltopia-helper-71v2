import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTools } from "@/hooks/useTools";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { tools, fetchTools } = useTools();

  // Fetch tools on component mount
  useQuery({
    queryKey: ['tools'],
    queryFn: fetchTools
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Group tools by location for the chart
  const locationData = tools.reduce((acc: any[], tool) => {
    const location = tool.location;
    const existingLocation = acc.find(item => item.location === location);
    
    if (existingLocation) {
      existingLocation.count += 1;
    } else {
      acc.push({ location, count: 1 });
    }
    
    return acc;
  }, []);

  // Prepare project status data for pie chart
  const projectStatusData = projects ? [
    { name: 'Planned', value: projects.filter(p => p.status === 'planned').length },
    { name: 'Ongoing', value: projects.filter(p => p.status === 'ongoing').length },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length }
  ] : [];

  const COLORS = ['#60a5fa', '#f97316', '#22c55e'];

  // Calculate statistics
  const totalTools = tools.length;
  const activeProjects = projects?.filter(p => p.status === 'ongoing').length || 0;
  const toolsInUse = tools.filter(t => t.status === 'in-use').length;
  const toolsInMaintenance = tools.filter(t => t.status === 'maintenance').length;

  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTools}</div>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolsInMaintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tools by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  tools: {
                    color: "#f97316",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData}>
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                      }}
                      labelStyle={{
                        color: "var(--foreground)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Tools"
                      fill="var(--color-tools)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Status Pie Chart */}
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
      </div>
    </div>
  );
}