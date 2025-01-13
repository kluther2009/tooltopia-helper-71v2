import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTools } from "@/hooks/useTools";
import { useToast } from "@/hooks/use-toast";

export function ExportDataSection() {
  const { tools, fetchTools } = useTools();
  const { toast } = useToast();

  const exportCSV = async () => {
    try {
      // Fetch latest tools data before export
      await fetchTools();
      
      if (!tools || tools.length === 0) {
        toast({
          variant: "destructive",
          title: "No Data",
          description: "There are no tools to export",
        });
        return;
      }

      console.log('Number of tools to export:', tools.length);
      
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
      
      // Create CSV rows from tools data
      const rows = tools.map(tool => {
        const locationParts = tool.location.split(' > ').map(part => part.trim());
        const row = [
          tool.name,
          locationParts[0] || '', // Primary location
          locationParts[1] || '', // Sub location
          locationParts[2] || '', // Specific location
          tool.status,
          tool.purchase_date || '',
          tool.warranty_length?.toString() || '',
          tool.purchase_cost ? `$${tool.purchase_cost}` : ''
        ];
        console.log('Generated row for tool:', tool.name, row);
        return row;
      });

      // Combine headers and rows, properly escaping fields
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(field => {
            // Escape fields that contain commas or quotes
            if (field.includes(',') || field.includes('"')) {
              return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
          }).join(',')
        )
      ].join('\n');

      console.log('Final CSV Content:', csvContent);

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
        description: `Successfully exported ${tools.length} tools to CSV`,
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