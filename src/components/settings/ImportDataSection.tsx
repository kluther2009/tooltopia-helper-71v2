
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTools } from "@/hooks/useTools";

export function ImportDataSection() {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const { fetchTools } = useTools();
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Only accept CSV files
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload a CSV file",
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Read file content
      const text = await file.text();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to import tools",
        });
        return;
      }
      
      // Parse CSV
      const lines = text.split("\n");
      const headers = lines[0].split(",");
      
      // Find index of each required column
      const nameIndex = headers.findIndex(h => h === "Tool Name");
      const primaryLocationIndex = headers.findIndex(h => h === "Primary Location");
      const subLocationIndex = headers.findIndex(h => h === "Sub Location");
      const specificLocationIndex = headers.findIndex(h => h === "Specific Location");
      const statusIndex = headers.findIndex(h => h === "Status");
      const purchaseDateIndex = headers.findIndex(h => h === "Purchase Date");
      const warrantyLengthIndex = headers.findIndex(h => h === "Warranty Length in Months");
      const purchaseCostIndex = headers.findIndex(h => h === "Purchase Cost");
      
      if (nameIndex === -1 || primaryLocationIndex === -1 || statusIndex === -1) {
        toast({
          variant: "destructive",
          title: "Invalid CSV Format",
          description: "The CSV file is missing required columns",
        });
        return;
      }
      
      const tools = [];
      let successCount = 0;
      const errors = [];
      
      // Start from index 1 to skip headers
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        // Handle CSV with quoted fields containing commas
        const row: string[] = [];
        let insideQuotes = false;
        let currentValue = "";
        
        for (let char of lines[i]) {
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            row.push(currentValue);
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        
        // Add the last field
        row.push(currentValue);
        
        // Extract data
        const name = row[nameIndex]?.trim();
        const primaryLocation = row[primaryLocationIndex]?.trim();
        const subLocation = subLocationIndex !== -1 ? row[subLocationIndex]?.trim() : '';
        const specificLocation = specificLocationIndex !== -1 ? row[specificLocationIndex]?.trim() : '';
        const status = row[statusIndex]?.trim() || 'available';
        const purchaseDate = purchaseDateIndex !== -1 ? row[purchaseDateIndex]?.trim() : '';
        const warrantyLength = warrantyLengthIndex !== -1 ? row[warrantyLengthIndex]?.trim() : '';
        const purchaseCost = purchaseCostIndex !== -1 ? row[purchaseCostIndex]?.trim() : '';
        
        // Skip rows without a name or location
        if (!name || !primaryLocation) {
          errors.push(`Row ${i}: Missing name or location`);
          continue;
        }
        
        // Clean purchase cost (remove $ sign)
        const cleanedCost = purchaseCost ? purchaseCost.replace('$', '') : '';
        
        // Build tool object
        const tool = {
          name,
          location: primaryLocation,
          sub_location_a: subLocation || null,
          sub_location_b: specificLocation || null,
          status,
          user_id: user.id,
          purchase_date: purchaseDate || null,
          warranty_length: warrantyLength ? parseInt(warrantyLength) : null,
          purchase_cost: cleanedCost ? parseFloat(cleanedCost) : null
        };
        
        tools.push(tool);
      }
      
      // Insert tools in batches to avoid timeouts
      const batchSize = 10;
      for (let i = 0; i < tools.length; i += batchSize) {
        const batch = tools.slice(i, i + batchSize);
        const { error, count } = await supabase
          .from('tools')
          .insert(batch)
          .select();
        
        if (error) {
          console.error("Error importing batch:", error);
          errors.push(`Error importing tools ${i+1} to ${i+batch.length}: ${error.message}`);
        } else {
          successCount += count || 0;
        }
      }
      
      // Refresh the tools list
      await fetchTools();
      
      // Show success/error message
      if (successCount > 0) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${successCount} tools`,
        });
      }
      
      if (errors.length > 0) {
        console.error("Import errors:", errors);
        toast({
          variant: "destructive",
          title: "Import Partially Failed",
          description: `${errors.length} errors occurred during import`,
        });
      }
      
    } catch (error) {
      console.error("Error importing tools:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "An error occurred while importing tools",
      });
    } finally {
      setIsImporting(false);
      // Reset the file input
      event.target.value = '';
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Import Data</h2>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Import your tools data from a CSV file
        </p>
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-file-input"
            disabled={isImporting}
          />
          <label htmlFor="csv-file-input">
            <Button
              variant="default"
              className="cursor-pointer"
              disabled={isImporting}
              asChild
            >
              <span>{isImporting ? "Importing..." : "Import from CSV"}</span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground">
            The CSV file should include columns for Tool Name, Primary Location, Sub Location, Specific Location, Status, Purchase Date, Warranty Length in Months, and Purchase Cost
          </p>
        </div>
      </div>
    </Card>
  );
}
