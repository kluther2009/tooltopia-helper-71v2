import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Tool } from "@/hooks/useTools";

interface ToolsOverviewProps {
  tools: Tool[];
  locationData: { location: string; count: number }[];
}

export function ToolsOverview({ tools, locationData }: ToolsOverviewProps) {
  const totalTools = tools.length;
  const toolsInMaintenance = tools.filter(t => t.status === 'maintenance').length;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Tools Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <Card className="mb-16">
        <CardHeader>
          <CardTitle>Tools by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ChartContainer
              config={{
                tools: {
                  color: "#f97316",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={locationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
                >
                  <XAxis 
                    dataKey="location" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
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
    </section>
  );
}