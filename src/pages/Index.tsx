import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card } from "@/components/ui/card";

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

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedTools = filteredTools.reduce((acc, tool) => {
    const primaryLocation = tool.location.split(" > ")[0];
    if (!acc[primaryLocation]) {
      acc[primaryLocation] = [];
    }
    acc[primaryLocation].push(tool);
    return acc;
  }, {} as Record<string, typeof tools[number][]>);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Tool Manager</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tools or locations..."
              className="pl-10 bg-card border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-8">
          {Object.entries(groupedTools).map(([location, locationTools]) => (
            <Card key={location} className="p-6 bg-card/50">
              <h2 className="text-xl font-semibold mb-4">{location}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locationTools.map((tool) => (
                  <ToolCard
                    key={tool.name}
                    name={tool.name}
                    location={tool.location}
                    status={tool.status}
                  />
                ))}
              </div>
            </Card>
          ))}
          {Object.keys(groupedTools).length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No tools found matching your search.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}