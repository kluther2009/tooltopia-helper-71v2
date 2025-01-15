import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"

interface WarrantyDateFieldsProps {
  purchaseDate: Date | undefined
  onPurchaseDateChange: (date: Date | undefined) => void
}

export function WarrantyDateFields({
  purchaseDate,
  onPurchaseDateChange,
}: WarrantyDateFieldsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
      <DatePicker
        date={purchaseDate}
        onSelect={onPurchaseDateChange}
      />
    </div>
  )
}