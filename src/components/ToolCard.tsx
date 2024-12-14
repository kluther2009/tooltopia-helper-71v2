import { Card } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DeleteToolDialog } from "./tool/DeleteToolDialog";
import { ToolStatusIcon } from "./tool/ToolStatusIcon";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

interface ToolCardProps {
  id: string;
  name: string | React.ReactNode;
  location: string;
  status: "available" | "in-use" | "maintenance";
  dragHandleProps?: DraggableProvidedDragHandleProps;
}

export function ToolCard({ id, name, location, status, dragHandleProps }: ToolCardProps) {
  const navigate = useNavigate();

  const renderLocation = () => {
    if (typeof name === 'string') {
      return (
        <div className="font-semibold text-sm sm:text-base text-gray-900">
          {name}
        </div>
      );
    }
    return name;
  };

  return (
    <Card 
      {...dragHandleProps}
      className="p-2 sm:p-3 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <ToolStatusIcon status={status} />
        <div className="flex-1 min-w-0">
          {renderLocation()}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/edit-tool/${id}`)}
            className="h-6 w-6 sm:h-8 sm:w-8 min-w-[1.5rem] sm:min-w-[2rem] !p-0 hover:bg-transparent bg-transparent"
          >
            <Pencil 
              className="h-3 w-3 sm:h-4 sm:w-4" 
              style={{ 
                color: '#64748b',
                fill: 'none',
                strokeWidth: 2.5
              }} 
            />
          </Button>
          <DeleteToolDialog id={id} name={typeof name === 'string' ? name : 'this tool'} />
        </div>
      </div>
    </Card>
  );
}