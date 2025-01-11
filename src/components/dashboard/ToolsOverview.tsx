import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Tool } from "@/hooks/useTools";

interface ToolsOverviewProps {
  tools: Tool[];
  locationData: { location: string; count: number }[];
}

const COLORS = ['#60a5fa', '#f97316', '#22c55e', '#a855f7', '#ec4899'];

export function ToolsOverview({ tools, locationData }: ToolsOverviewProps) {
  const totalTools = tools.length;
  const toolsInMaintenance = tools.filter(t => t.status === 'maintenance').length;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Tools Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Tools In Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolsInMaintenance}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
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
                  <PieChart>
                    <Pie
                      data={locationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {locationData.map((entry, index) => (
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
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}