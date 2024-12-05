import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
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

export default function Storage() {
  const groupedTools = tools.reduce((acc, tool) => {
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
        <h1 className="text-3xl font-bold mb-8">Storage Locations</h1>
        
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
        </div>
      </div>
    </Layout>
  );
}