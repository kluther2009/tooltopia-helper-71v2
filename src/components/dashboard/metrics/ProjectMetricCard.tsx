import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectMetrics {
  count: number;
  totalCost: number;
  toolsCount: number;
  tasksCount: number;
}

interface MetricCardProps {
  title: string;
  metrics: ProjectMetrics;
}

export function ProjectMetricCard({ title, metrics }: MetricCardProps) {
  return (
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
}