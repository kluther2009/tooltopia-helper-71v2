import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FilePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string | null;
}

export function FilePreviewDialog({ isOpen, onOpenChange, filePath }: FilePreviewDialogProps) {
  if (!filePath) return null;

  const fileExtension = filePath.split('.').pop()?.toLowerCase();
  const isPDF = fileExtension === 'pdf';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Document Preview</DialogTitle>
        </DialogHeader>
        <div className="w-full max-h-[80vh] overflow-auto">
          {isPDF ? (
            <iframe
              src={filePath}
              className="w-full h-[80vh]"
              title="Document Preview"
            />
          ) : (
            <img 
              src={filePath} 
              alt="Document Preview" 
              className="w-full h-auto"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}