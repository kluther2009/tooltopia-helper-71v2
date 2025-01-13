import { ToolCard } from "@/components/ToolCard";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tools, setTools] = useState<any[]>([]);

  const fetchTools = async () => {
    try {
      console.log('Fetching tools...');
      const { data, error } = await supabase
        .from('tools')
        .select('*');
      
      if (error) {
        console.error('Error fetching tools:', error);
        return;
      }
      
      if (data) {
        console.log('Tools fetched successfully:', data);
        setTools(data);
      }
    } catch (error) {
      console.error('Error in fetchTools:', error);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const formatLocationDisplay = (tool: any) => {
    return (
      <div className="space-y-1">
        <div className="font-semibold text-sm sm:text-base text-gray-900">
          {tool.name}
        </div>
        <div className="flex items-center text-xs font-bold text-gray-700">
          <MapPin className="h-3 w-3 mr-1" />
          {tool.location}
        </div>
        {tool.sub_location_a && (
          <div className="flex items-center text-xs font-bold text-gray-700 ml-3">
            <MapPin className="h-3 w-3 mr-1" />
            {tool.sub_location_a}
          </div>
        )}
        {tool.sub_location_b && tool.sub_location_a && (
          <div className="flex items-center text-xs font-bold text-gray-700 ml-6">
            <MapPin className="h-3 w-3 mr-1" />
            {tool.sub_location_b}
          </div>
        )}
      </div>
    );
  };

  const filteredTools = tools
    .filter(tool => 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-left w-full text-white">ToolTrackerHub</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search tools..."
              className="pl-8 sm:pl-10 bg-white text-gray-900 border-input w-full text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              name={formatLocationDisplay(tool)}
              location={tool.location}
              status={tool.status}
              purchaseDate={tool.purchase_date}
              warrantyLength={tool.warranty_length}
              purchaseCost={tool.purchase_cost}
              warrantyFilePath={tool.warranty_file_path}
              receiptFilePath={tool.receipt_file_path}
            />
          ))}
          {filteredTools.length === 0 && (
            <div className="col-span-full text-center py-4 sm:py-8 text-white font-bold text-sm">
              No tools found matching your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}