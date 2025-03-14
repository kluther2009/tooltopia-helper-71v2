
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tool } from "@/hooks/useTools";
import { differenceInMonths } from "date-fns";

interface ToolMetricsGridProps {
  tools: Tool[];
}

export function ToolMetricsGrid({ tools }: ToolMetricsGridProps) {
  const totalTools = tools.length;
  const toolsInMaintenance = tools.filter(t => t.status === 'maintenance').length;
  const toolsInUse = tools.filter(t => t.status === 'in-use').length;
  const toolsOnLoan = tools.filter(t => t.status === 'loaned').length;
  
  const toolsUnderWarranty = tools.filter(tool => {
    if (!tool.purchase_date || !tool.warranty_length) {
      return false;
    }
    
    const purchaseDate = new Date(tool.purchase_date);
    const currentDate = new Date();
    const monthsPassed = differenceInMonths(currentDate, purchaseDate);
    
    return monthsPassed < tool.warranty_length;
  }).length;

  const toolsWithExpiringWarranty = tools.filter(tool => {
    if (!tool.purchase_date || !tool.warranty_length) {
      return false;
    }
    
    const purchaseDate = new Date(tool.purchase_date);
    const currentDate = new Date();
    const monthsPassed = differenceInMonths(currentDate, purchaseDate);
    const monthsLeft = tool.warranty_length - monthsPassed;
    
    // Only count as expiring if there's more than 0 but less than or equal to 1 month left
    return monthsLeft > 0 && monthsLeft <= 1;
  }).length;

  const toolsWithMaintenanceDue = tools.filter(tool => {
    if (!tool.last_maintenance_date || !tool.maintenance_period_months) {
      return false;
    }
    
    const maintenanceDate = new Date(tool.last_maintenance_date);
    const currentDate = new Date();
    const monthsPassed = differenceInMonths(currentDate, maintenanceDate);
    const monthsLeft = tool.maintenance_period_months - monthsPassed;
    
    // Only count as maintenance due if there's more than 0 but less than or equal to 1 month left
    return monthsLeft > 0 && monthsLeft <= 1;
  }).length;

  const toolsWithDocuments = tools.filter(tool => {
    return Boolean(tool.warranty_file_path);
  }).length;

  const metrics = [
    { title: "Total Tools", value: totalTools },
    { title: "Tools In Use", value: toolsInUse },
    { title: "Tools In Maintenance", value: toolsInMaintenance },
    { title: "Tools On Loan", value: toolsOnLoan },
    { title: "Tools Under Warranty", value: toolsUnderWarranty },
    { title: "Expiring Warranties", value: toolsWithExpiringWarranty },
    { title: "Maintenance Due Soon", value: toolsWithMaintenanceDue },
    { title: "Tools With Documents", value: toolsWithDocuments }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
