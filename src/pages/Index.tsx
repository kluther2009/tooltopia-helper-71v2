import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const tools = [
  { name: "Power Drill", location: "Garage Cabinet A", status: "available" },
  { name: "Circular Saw", location: "Workshop", status: "in-use" },
  { name: "Hammer Set", location: "Tool Box 2", status: "available" },
  { name: "Measuring Tape", location: "Drawer 1", status: "maintenance" },
] as const;

export default function Index() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Tool Manager</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tools..."
              className="pl-10 bg-card border-gray-700"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard
              key={tool.name}
              name={tool.name}
              location={tool.location}
              status={tool.status}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}