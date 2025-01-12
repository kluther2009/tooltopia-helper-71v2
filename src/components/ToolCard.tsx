import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ToolStatusIcon } from "./tool/ToolStatusIcon";
import { differenceInMonths } from "date-fns";
import { TooltipProvider } from "./ui/tooltip";
import { ToolCardActions } from "./tool/ToolCardActions";
import { ToolWarrantyInfo } from "./tool/ToolWarrantyInfo";
import { ToolDocumentsDialog } from "./tool/ToolDocumentsDialog";

interface ToolCardProps {
  id: string;
  name: string | React.ReactNode;
  location: string;
  status: "available" | "in-use" | "maintenance" | "loaned";
  purchaseDate?: string | null;
  warrantyLength?: number | null;
  purchaseCost?: number | null;
  warrantyFilePath?: string | null;
  receiptFilePath?: string | null;
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
  receiptFilePath,
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

  const warrantyMonthsLeft = calculateWarrantyMonthsLeft();
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
            <ToolCardActions
              id={id}
              name={name}
              documentCount={documentCount}
              warrantyFilePath={warrantyFilePath}
              receiptFilePath={receiptFilePath}
              onDocumentClick={() => setIsDocumentDialogOpen(true)}
              onEdit={onEdit}
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
        receiptFilePath={receiptFilePath}
      />
    </TooltipProvider>
  );
}