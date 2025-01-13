import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTools } from "@/hooks/useTools";
import { useToast } from "@/hooks/use-toast";

export function ExportDataSection() {
  const { tools } = useTools();
  const { toast } = useToast();

  const exportCSV = () => {
    try {
      const headers = [
        "Tool Name",
        "Primary Location",
        "Sub Location",
        "Specific Location",
        "Status",
        "Purchase Date",
        "Warranty Length in Months",
        "Purchase Cost"
      ];
      
      const csvContent = tools.map(tool => [
        tool.name,
        tool.location,
        tool.sub_location_a || "",
        tool.sub_location_b || "",
        tool.status,
        tool.purchase_date || "",
        tool.warranty_length || "",
        tool.purchase_cost ? `$${tool.purchase_cost}` : ""
      ].join(",")).join("\n");

      const csv = [headers.join(","), csvContent].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tools-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Tools exported successfully as CSV",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export tools as CSV",
      });
    }
  };

  const exportPDF = () => {
    // For now, we'll show a toast that PDF export is coming soon
    toast({
      title: "Coming Soon",
      description: "PDF export functionality will be available soon",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileDown className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Export Data</h2>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Export your tools data in different formats
        </p>
        <div className="flex gap-4">
          <Button onClick={exportCSV}>
            Export as CSV
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            Export as PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}