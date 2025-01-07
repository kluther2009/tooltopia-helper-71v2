import { Card } from "@/components/ui/card";
import { Pencil, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DeleteToolDialog } from "./tool/DeleteToolDialog";
import { ToolStatusIcon } from "./tool/ToolStatusIcon";
import { differenceInMonths } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ToolCardProps {
  id: string;
  name: string | React.ReactNode;
  location: string;
  status: "available" | "in-use" | "maintenance";
  purchaseDate?: string | null;
  warrantyLength?: number | null;
  purchaseCost?: number | null;
  warrantyFilePath?: string | null;
  receiptFilePath?: string | null;
}

export function ToolCard({ 
  id, 
  name, 
  status, 
  purchaseDate, 
  warrantyLength, 
  purchaseCost,
  warrantyFilePath,
  receiptFilePath
}: ToolCardProps) {
  const navigate = useNavigate();
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);

  const calculateWarrantyMonthsLeft = () => {
    if (!purchaseDate || !warrantyLength) return null;
    
    const purchaseDateTime = new Date(purchaseDate);
    const currentDate = new Date();
    const totalMonthsPassed = differenceInMonths(currentDate, purchaseDateTime);
    const monthsLeft = warrantyLength - totalMonthsPassed;
    
    return Math.max(0, monthsLeft);
  };

  const warrantyMonthsLeft = calculateWarrantyMonthsLeft();
  const hasWarrantyInfo = purchaseCost || warrantyMonthsLeft !== null;
  const hasDocuments = warrantyFilePath || receiptFilePath;
  const documentCount = (warrantyFilePath ? 1 : 0) + (receiptFilePath ? 1 : 0);

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

  const openDocument = async (filePath: string) => {
    const { data } = supabase.storage
      .from('warranty-files')
      .getPublicUrl(filePath);
    
    if (data.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
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
            <div className="flex items-center gap-1 shrink-0">
              {hasDocuments && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDocumentDialogOpen(true);
                      }}
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
                  <TooltipContent>View Documents</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>Edit Tool</TooltipContent>
              </Tooltip>
              <DeleteToolDialog id={id} name={typeof name === 'string' ? name : 'this tool'} />
            </div>
          </div>

          {hasWarrantyInfo && (
            <div className="text-sm text-gray-600 flex items-center justify-between border-t pt-2 mt-1">
              {purchaseCost && (
                <div>
                  Purchase Price: ${purchaseCost.toFixed(2)}
                </div>
              )}
              {warrantyMonthsLeft !== null && (
                <div>
                  Warranty {warrantyMonthsLeft} months left
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {warrantyFilePath && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => openDocument(warrantyFilePath)}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Warranty
              </Button>
            )}
            {receiptFilePath && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => openDocument(receiptFilePath)}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Receipt
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}