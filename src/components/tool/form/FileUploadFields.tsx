import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FileUploadFieldsProps {
  onWarrantyFileChange: (file: File | null) => void
  onReceiptFileChange: (file: File | null) => void
}

export function FileUploadFields({
  onWarrantyFileChange,
  onReceiptFileChange
}: FileUploadFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="warrantyFile">Warranty File (Optional)</Label>
        <Input
          type="file"
          id="warrantyFile"
          onChange={(e) => onWarrantyFileChange(e.target.files?.[0] || null)}
          className="bg-background text-foreground"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="receiptFile">Receipt File (Optional)</Label>
        <Input
          type="file"
          id="receiptFile"
          onChange={(e) => onReceiptFileChange(e.target.files?.[0] || null)}
          className="bg-background text-foreground"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>
    </>
  )
}