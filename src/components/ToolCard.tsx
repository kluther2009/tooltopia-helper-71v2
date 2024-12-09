import { Card } from "@/components/ui/card";
import { Wrench, Pencil } from "lucide-react";
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

  console.log('Rendering ToolCard for:', name);
  console.log('Edit icon should be visible and black');

  return (
    <Card className="p-4 bg-gray-200 border-2 border-black hover:bg-gray-300 transition-colors">
      <div className="flex items-start gap-4 w-full">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between w-full">
            <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/edit-tool/${id}`)}
              className="h-8 w-8 min-w-[2rem] !p-0 hover:bg-transparent bg-transparent"
            >
              <Pencil 
                className="h-4 w-4" 
                style={{ 
                  color: '#000000',
                  fill: 'none',
                  strokeWidth: 2.5
                }} 
              />
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            {locationParts.map((part, index) => (
              <p key={index} className="text-sm text-gray-500 flex items-center">
                {index > 0 && <span className="ml-2">↳</span>}
                <span className={`${index > 0 ? "ml-2" : ""}`}>{part}</span>
              </p>
            ))}
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              status === "available" ? "bg-green-100 text-green-700" :
              status === "in-use" ? "bg-blue-100 text-blue-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}