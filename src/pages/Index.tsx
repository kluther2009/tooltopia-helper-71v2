import { Layout } from "@/components/Layout";
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
    const { data, error } = await supabase
      .from('tools')
      .select('*');
    
    if (!error && data) {
      setTools(data);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const filteredTools = tools
    .filter(tool => 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const formatLocationDisplay = (tool: any) => {
    const locations = [];
    locations.push(tool.name);
    
    if (tool.location) {
      locations.push(
        <div key="location" className="flex items-center text-xs font-bold text-gray-700">
          <MapPin className="h-3 w-3 mr-1" />
          {tool.location}
        </div>
      );
    }
    
    if (tool.sub_location_a) {
      locations.push(
        <div key="sub_a" className="flex items-center text-xs font-bold text-gray-700 ml-3">
          <MapPin className="h-3 w-3 mr-1" />
          {tool.sub_location_a}
        </div>
      );
    }
    
    if (tool.sub_location_b) {
      locations.push(
        <div key="sub_b" className="flex items-center text-xs font-bold text-gray-700 ml-6">
          <MapPin className="h-3 w-3 mr-1" />
          {tool.sub_location_b}
        </div>
      );
    }

    return (
      <div>
        {locations}
      </div>
    );
  };

  return (
    <Layout>
      <Card className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-left w-full text-white">ToolTrackerHub</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
            <Input
              placeholder="Search tools..."
              className="pl-8 sm:pl-10 bg-background text-black border-input w-full text-sm font-bold"
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
            />
          ))}
          {filteredTools.length === 0 && (
            <div className="col-span-full text-center py-4 sm:py-8 text-black font-bold text-sm">
              No tools found matching your search.
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
}