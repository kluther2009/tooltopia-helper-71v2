import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ToolStatusIcon } from "./tool/ToolStatusIcon";
import { differenceInMonths } from "date-fns";
import { TooltipProvider } from "./ui/tooltip";
import { ToolCardActions } from "./tool/ToolCardActions";
import { ToolWarrantyInfo } from "./tool/ToolWarrantyInfo";
import { ToolDocumentsDialog } from "./tool/ToolDocumentsDialog";
import { FileText, Book } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ToolCardProps {
  id: string;
  name: string | React.ReactNode;
  location: string;
  status: "available" | "in-use" | "maintenance" | "loaned";
  purchaseDate?: string | null;
  warrantyLength?: number | null;
  purchaseCost?: number | null;
  warrantyFilePath?: string | null;
  manualId?: string | null;
  onEdit?: () => void;
}

export function ToolCard({ 
  id, 
  name, 
  status, 
  purchaseDate, 
  warrantyLength, 
  purchaseCost,
  warrantyFilePath,
  manualId,
  onEdit
}: ToolCardProps) {
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);

  const calculateWarrantyMonthsLeft = () => {
    if (!purchaseDate || !warrantyLength) return null;
    
    const purchaseDateTime = new Date(purchaseDate);
    const currentDate = new Date();
    const totalMonthsPassed = differenceInMonths(currentDate, purchaseDateTime);
    const monthsLeft = warrantyLength - totalMonthsPassed;
    
    return Math.max(0, monthsLeft);
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

  const warrantyMonthsLeft = calculateWarrantyMonthsLeft();
  const hasWarrantyDocs = warrantyFilePath;

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
    <TooltipProvider>
      <Card 
        className="p-2 sm:p-3 bg-white border-2 border-black hover:bg-gray-50 transition-colors shadow-sm cursor-grab active:cursor-grabbing"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2 sm:gap-3">
            <ToolStatusIcon status={status} />
            <div className="flex-1 min-w-0">
              {renderLocation()}
            </div>
            <div className="flex items-center gap-1">
              {hasWarrantyDocs && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDocumentDialogOpen(true);
                      }}
                      className="h-6 w-6 sm:h-8 sm:w-8 min-w-[1.5rem] sm:min-w-[2rem] !p-0 hover:bg-transparent bg-transparent"
                    >
                      <FileText 
                        className="h-3 w-3 sm:h-4 sm:w-4" 
                        style={{ 
                          color: '#64748b',
                          fill: 'none',
                          strokeWidth: 2.5
                        }} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Warranty Documents</TooltipContent>
                </Tooltip>
              )}
              {manualId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleManualClick}
                      className="h-6 w-6 sm:h-8 sm:w-8 min-w-[1.5rem] sm:min-w-[2rem] !p-0 hover:bg-transparent bg-transparent"
                    >
                      <Book 
                        className="h-3 w-3 sm:h-4 sm:w-4" 
                        style={{ 
                          color: '#64748b',
                          fill: 'none',
                          strokeWidth: 2.5
                        }} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Manual</TooltipContent>
                </Tooltip>
              )}
            </div>
            <ToolCardActions
              id={id}
              name={name}
              documentCount={hasWarrantyDocs ? 1 : 0}
              warrantyFilePath={warrantyFilePath}
              onDocumentClick={() => setIsDocumentDialogOpen(true)}
              onEdit={onEdit}
              manualId={manualId}
            />
          </div>

          <ToolWarrantyInfo
            purchaseCost={purchaseCost}
            warrantyMonthsLeft={warrantyMonthsLeft}
          />
        </div>
      </Card>

      <ToolDocumentsDialog
        open={isDocumentDialogOpen}
        onOpenChange={setIsDocumentDialogOpen}
        warrantyFilePath={warrantyFilePath}
      />
    </TooltipProvider>
  );
}