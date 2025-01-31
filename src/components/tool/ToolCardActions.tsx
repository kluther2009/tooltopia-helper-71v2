import { Button } from "@/components/ui/button";
import { Pencil, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteToolDialog } from "./DeleteToolDialog";
import { Badge } from "../ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolCardActionsProps {
  id: string;
  name: string | React.ReactNode;
  documentCount: number;
  warrantyFilePath?: string | null;
  receiptFilePath?: string | null;
  onDocumentClick: () => void;
  onEdit?: () => void;
  manualId?: string | null;
}

export function ToolCardActions({
  id,
  name,
  documentCount,
  warrantyFilePath,
  receiptFilePath,
  onDocumentClick,
  onEdit,
  manualId,
}: ToolCardActionsProps) {
  const navigate = useNavigate();
  const hasDocuments = warrantyFilePath || receiptFilePath;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/edit-tool/${id}`);
    }
  };

  const handleManualClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!manualId) return;

    try {
      const { data: manualData, error: manualError } = await supabase
        .from('manuals')
        .select('file_path')
        .eq('id', manualId)
        .single();

      if (manualError) throw manualError;
      
      if (manualData?.file_path) {
        const { data } = supabase.storage
          .from('warranty-files')
          .getPublicUrl(manualData.file_path);
        
        if (data.publicUrl) {
          window.open(data.publicUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error opening manual:', error);
      toast.error('Failed to open manual');
    }
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      {hasDocuments && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDocumentClick}
              className="h-6 w-6 sm:h-8 sm:w-8 min-w-[1.5rem] sm:min-w-[2rem] !p-0 hover:bg-transparent bg-transparent relative"
            >
              <FileText 
                className="h-3 w-3 sm:h-4 sm:w-4" 
                style={{ 
                  color: '#64748b',
                  fill: 'none',
                  strokeWidth: 2.5
                }} 
              />
              {documentCount > 1 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-3 w-3 p-0 flex items-center justify-center text-[10px] bg-blue-500"
                  variant="secondary"
                >
                  {documentCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>View Warranty Documents</TooltipContent>
        </Tooltip>
      )}
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