import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Tool } from "@/hooks/useTools";
import { differenceInMonths } from "date-fns";

interface ToolsOverviewProps {
  tools: Tool[];
  locationData: { location: string; count: number }[];
}

export function ToolsOverview({ tools, locationData }: ToolsOverviewProps) {
  const totalTools = tools.length;
  const toolsInMaintenance = tools.filter(t => t.status === 'maintenance').length;
  const toolsInUse = tools.filter(t => t.status === 'in-use').length;
  
  // Calculate tools under warranty
  const toolsUnderWarranty = tools.filter(tool => {
    if (!tool.purchase_date || !tool.warranty_length) return false;
    const purchaseDate = new Date(tool.purchase_date);
    const currentDate = new Date();
    const monthsPassed = differenceInMonths(currentDate, purchaseDate);
    return monthsPassed < tool.warranty_length;
  }).length;

  // Calculate tools with pictures (those that have warranty_file_path or receipt_file_path)
  const toolsWithPictures = tools.filter(tool => 
    tool.warranty_file_path || tool.receipt_file_path
  ).length;

  return (
    <section className="space-y-6">      
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
              Tools In Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolsInMaintenance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tools Under Warranty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolsUnderWarranty}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tools With Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolsWithPictures}</div>
          </CardContent>
        </Card>
      </div>

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
                <BarChart 
                  data={locationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                >
                  <XAxis 
                    dataKey="location" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
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