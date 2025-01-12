import { Tool } from "@/hooks/useTools";
import { ToolMetricsGrid } from "./metrics/ToolMetricsGrid";
import { LocationBarChart } from "./charts/LocationBarChart";

interface ToolsOverviewProps {
  tools: Tool[];
  locationData: { location: string; count: number }[];
}

export function ToolsOverview({ tools, locationData }: ToolsOverviewProps) {
  return (
    <section className="space-y-6">      
      <ToolMetricsGrid tools={tools} />
      <LocationBarChart locationData={locationData} />
    </section>
  );
}