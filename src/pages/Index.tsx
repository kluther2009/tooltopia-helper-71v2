import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Tool Manager</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tools or locations..."
              className="pl-10 bg-background text-foreground border-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              name={tool.name}
              location={tool.location}
              status={tool.status}
              onLocationUpdate={fetchTools}
            />
          ))}
          {filteredTools.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400">
              No tools found matching your search.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}