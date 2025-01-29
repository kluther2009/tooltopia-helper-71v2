import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ManualSearchDialog } from "./ManualSearchDialog"
import { Search } from "lucide-react"

interface FileUploadFieldsProps {
  onWarrantyFileChange: (file: File | null) => void
  onReceiptFileChange: (file: File | null) => void
  onManualSelect?: (manual: { id: string; make: string; model: string }) => void
  selectedManual?: { make: string; model: string } | null
}

export function FileUploadFields({
  onWarrantyFileChange,
  onReceiptFileChange,
  onManualSelect,
  selectedManual
}: FileUploadFieldsProps) {
  const [showManualSearch, setShowManualSearch] = useState(false)

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="warrantyFile">User guides/Maintenance Guide</Label>
        <div className="space-y-2">
          {selectedManual ? (
            <div className="flex items-center justify-between rounded-md border p-2">
              <span className="text-sm">
                Selected: {selectedManual.make} - {selectedManual.model}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onManualSelect?.({ id: "", make: "", model: "" })}
              >
                Change
              </Button>
            </div>
          ) : (
            <>
              <Input
                type="file"
                id="warrantyFile"
                onChange={(e) => onWarrantyFileChange(e.target.files?.[0] || null)}
                className="bg-background text-foreground"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div className="flex items-center gap-2">
                <div className="relative after:content-['or'] after:absolute after:right-[-1rem] after:top-1/2 after:-translate-y-1/2 after:text-muted-foreground">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowManualSearch(true)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search Existing Manuals
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="receiptFile">Warranty/Receipt File (Optional)</Label>
        <Input
          type="file"
          id="receiptFile"
          onChange={(e) => onReceiptFileChange(e.target.files?.[0] || null)}
          className="bg-background text-foreground"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>

      <ManualSearchDialog
        open={showManualSearch}
        onOpenChange={setShowManualSearch}
        onManualSelect={(manual) => {
          onManualSelect?.(manual)
          setShowManualSearch(false)
        }}
      />
    </>
  )
}