import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ToolDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warrantyFilePath: string | null | undefined;
}

export function ToolDocumentsDialog({
  open,
  onOpenChange,
  warrantyFilePath,
}: ToolDocumentsDialogProps) {
  const handleFileClick = (filePath: string) => {
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
          <DialogTitle>Tool Documents</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {warrantyFilePath && (
            <div className="flex justify-between items-center">
              <span>Warranty Document</span>
              <Button
                variant="outline"
                onClick={() => handleFileClick(warrantyFilePath)}
              >
                View
              </Button>
            </div>
          )}
          {!warrantyFilePath && (
            <p className="text-sm text-gray-500">No documents available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}