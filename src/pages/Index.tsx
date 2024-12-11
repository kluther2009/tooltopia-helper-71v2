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

  return (
    <Layout>
      <Card className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-left w-full">Tool Manager</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tools..."
              className="pl-8 sm:pl-10 bg-background text-foreground border-input w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {filteredTools.map((tool) => {
            const locations = [
              tool.location,
              tool.sub_location_a,
              tool.sub_location_b
            ].filter(Boolean);

            const displayName = (
              <div className="space-y-1">
                <div>{tool.name}</div>
                {locations.map((loc, index) => (
                  <div 
                    key={index} 
                    className="flex items-center text-xs text-gray-500"
                    style={{ marginLeft: `${index * 12}px` }}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {loc}
                  </div>
                ))}
              </div>
            );

            return (
              <ToolCard
                key={tool.id}
                id={tool.id}
                name={displayName}
                location={tool.location}
                status={tool.status}
              />
            );
          })}
          {filteredTools.length === 0 && (
            <div className="col-span-full text-center py-4 sm:py-8 text-gray-400 text-sm">
              No tools found matching your search.
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
}