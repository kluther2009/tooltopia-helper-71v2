import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface LocationBarChartProps {
  locationData: { location: string; count: number }[];
}

export function LocationBarChart({ locationData }: LocationBarChartProps) {
  return (
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
  );
}