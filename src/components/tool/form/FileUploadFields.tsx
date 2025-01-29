import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FileUploadFieldsProps {
  onWarrantyFileChange: (file: File | null) => void;
  onReceiptFileChange: (file: File | null) => void;
  warrantyFilePath?: string | null;
  receiptFilePath?: string | null;
}

export function FileUploadFields({
  onWarrantyFileChange,
  onReceiptFileChange,
  warrantyFilePath,
  receiptFilePath
}: FileUploadFieldsProps) {
  const getFileName = (path: string | null | undefined) => {
    if (!path) return '';
    return path.split('/').pop() || '';
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="warrantyFile">Warranty File (Optional)</Label>
        <div className="flex flex-col gap-2">
          {warrantyFilePath && (
            <div className="text-sm text-muted-foreground">
              Current file: {getFileName(warrantyFilePath)}
            </div>
          )}
          <Input
            type="file"
            id="warrantyFile"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onWarrantyFileChange(file);
            }}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            className="bg-background text-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="receiptFile">Receipt File (Optional)</Label>
        <div className="flex flex-col gap-2">
          {receiptFilePath && (
            <div className="text-sm text-muted-foreground">
              Current file: {getFileName(receiptFilePath)}
            </div>
          )}
          <Input
            type="file"
            id="receiptFile"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onReceiptFileChange(file);
            }}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            className="bg-background text-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>
      </div>
    </>
  );
}