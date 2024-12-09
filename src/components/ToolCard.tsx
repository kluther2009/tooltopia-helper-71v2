import { Card } from "@/components/ui/card";
import { Wrench, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ToolCardProps {
  id: string;
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance";
}

export function ToolCard({ id, name, location, status }: ToolCardProps) {
  const navigate = useNavigate();
  const locationParts = location.split(" > ");

  return (
    <Card className="p-4 bg-card hover:bg-card/80 transition-colors">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{name}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/edit-tool/${id}`)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            {locationParts.map((part, index) => (
              <p key={index} className="text-sm text-gray-400 flex items-center">
                {index > 0 && <span className="ml-2">↳</span>}
                <span className={`${index > 0 ? "ml-2" : ""}`}>{part}</span>
              </p>
            ))}
          </div>
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