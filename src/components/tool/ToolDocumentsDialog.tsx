import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ToolDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warrantyFilePath?: string | null;
  receiptFilePath?: string | null;
}

export function ToolDocumentsDialog({
  open,
  onOpenChange,
  warrantyFilePath,
  receiptFilePath,
}: ToolDocumentsDialogProps) {
  const openDocument = async (filePath: string) => {
    const { data } = supabase.storage
      .from('warranty-files')
      .getPublicUrl(filePath);
    
    if (data.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
}