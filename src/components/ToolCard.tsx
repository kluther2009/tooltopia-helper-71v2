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

  return (
    <Card className="p-2 sm:p-3 bg-gray-200 border border-black hover:bg-gray-300 transition-colors">
      <div className="flex items-start gap-2 sm:gap-3 w-full">
        <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
          <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between w-full gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{name}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/edit-tool/${id}`)}
              className="h-6 w-6 sm:h-8 sm:w-8 min-w-[1.5rem] sm:min-w-[2rem] !p-0 hover:bg-transparent bg-transparent shrink-0"
            >
              <Pencil 
                className="h-3 w-3 sm:h-4 sm:w-4" 
                style={{ 
                  color: '#000000',
                  fill: 'none',
                  strokeWidth: 2.5
                }} 
              />
            </Button>
          </div>
          <div className="flex flex-col gap-0.5 sm:gap-1">
            {locationParts.map((part, index) => (
              <p key={index} className="text-xs sm:text-sm text-gray-500 flex items-center truncate">
                {index > 0 && <span className="ml-1 sm:ml-2">↳</span>}
                <span className={`${index > 0 ? "ml-1 sm:ml-2" : ""}`}>{part}</span>
              </p>
            ))}
          </div>
          <div className="mt-1.5 sm:mt-2">
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
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