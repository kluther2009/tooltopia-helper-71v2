import { Button } from "@/components/ui/button";
import { FileText, MoreVertical, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolCardActionsProps {
  id: string;
  name: string | React.ReactNode;
  documentCount: number;
  warrantyFilePath?: string | null;
  receiptFilePath?: string | null;
  onDocumentClick: () => void;
  onEdit?: () => void;
}

export function ToolCardActions({
  documentCount,
  onDocumentClick,
  onEdit
}: ToolCardActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {documentCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDocumentClick}
            >
              <FileText className="h-4 w-4" />
              <span className="sr-only">View documents</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View documents ({documentCount})</p>
          </TooltipContent>
        </Tooltip>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}