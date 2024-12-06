import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const tools = [
  { 
    name: "Power Drill", 
    location: "Workshop > Cabinet A > Top Shelf", 
    status: "available" as const
  },
  { 
    name: "Circular Saw", 
    location: "Workshop > Storage Room > Tool Wall", 
    status: "in-use" as const
  },
  { 
    name: "Hammer Set", 
    location: "Garage > Tool Box 2", 
    status: "available" as const
  },
  { 
    name: "Measuring Tape", 
    location: "Workshop > Drawer 1", 
    status: "maintenance" as const
  },
];

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = tools
    .filter(tool => 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

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
              key={tool.name}
              name={tool.name}
              location={tool.location}
              status={tool.status}
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