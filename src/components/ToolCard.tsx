import { Card } from "@/components/ui/card";
import { Tool } from "lucide-react";

interface ToolCardProps {
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance";
}

export function ToolCard({ name, location, status }: ToolCardProps) {
  return (
    <Card className="p-4 bg-card hover:bg-card/80 transition-colors cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Tool className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-400">{location}</p>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              status === "available" ? "bg-green-500/20 text-green-400" :
              status === "in-use" ? "bg-blue-500/20 text-blue-400" :
              "bg-yellow-500/20 text-yellow-400"
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}