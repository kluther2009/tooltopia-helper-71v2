import { Dialog, DialogContent } from "@/components/ui/dialog";

interface FilePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string | null;
}

export function FilePreviewDialog({ isOpen, onOpenChange, filePath }: FilePreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card">
        {filePath && (
          <img 
            src={filePath} 
            alt="Document Preview" 
            className="w-full h-auto"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}