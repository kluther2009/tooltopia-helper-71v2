import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteToolDialog } from "./DeleteToolDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolCardActionsProps {
  id: string;
  name: string | React.ReactNode;
  onEdit?: () => void;
  manualId?: string | null;
}

export function ToolCardActions({
  id,
  name,
  onEdit,
  manualId,
}: ToolCardActionsProps) {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/edit-tool/${id}`);
    }
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
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
        </TooltipTrigger>
        <TooltipContent>Edit Tool</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <DeleteToolDialog id={id} name={typeof name === 'string' ? name : 'this tool'} />
          </div>
        </TooltipTrigger>
        <TooltipContent>Delete Tool</TooltipContent>
      </Tooltip>
    </div>
  );
}