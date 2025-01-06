import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolCardProps {
  id: string;
  name: React.ReactNode;
  location: string;
  status: string;
  purchaseDate?: string | null;
  warrantyLength?: number | null;
  purchaseCost?: number | null;
  warrantyFilePath?: string | null;
  receiptFilePath?: string | null;
}

export function ToolCard({
  id,
  name,
  location,
  status,
  purchaseDate,
  warrantyLength,
  purchaseCost,
  warrantyFilePath,
  receiptFilePath,
}: ToolCardProps) {
  return (
    <Card className="p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {name}
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => window.location.href = `/edit-tool/${id}`}
                >
                  <Pencil className="h-4 w-4 text-gray-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Tool</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => window.location.href = `/tool/${id}`}
                >
                  <FileText className="h-4 w-4 text-gray-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
}