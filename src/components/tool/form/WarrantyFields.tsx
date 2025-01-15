import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { WarrantyDateFields } from "./WarrantyDateFields"

interface WarrantyFieldsProps {
  purchaseDate: string
  warrantyLength: string
  purchaseCost: string
  onPurchaseDateChange: (value: string) => void
  onWarrantyLengthChange: (value: string) => void
  onPurchaseCostChange: (value: string) => void
}

export function WarrantyFields({
  purchaseDate,
  warrantyLength,
  purchaseCost,
  onPurchaseDateChange,
  onWarrantyLengthChange,
  onPurchaseCostChange
}: WarrantyFieldsProps) {
  return (
    <>
      <WarrantyDateFields
        purchaseDate={purchaseDate ? new Date(purchaseDate) : undefined}
        onPurchaseDateChange={(date) => onPurchaseDateChange(date ? date.toISOString().split('T')[0] : '')}
      />

      <div className="space-y-2">
        <Label htmlFor="warrantyLength">Warranty Length in Months (Optional)</Label>
        <Input
          type="number"
          id="warrantyLength"
          value={warrantyLength}
          onChange={(e) => onWarrantyLengthChange(e.target.value)}
          min="0"
          className="bg-background text-foreground"
          placeholder="e.g., 12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchaseCost">Purchase Cost (Optional)</Label>
        <Input
          type="number"
          id="purchaseCost"
          value={purchaseCost}
          onChange={(e) => onPurchaseCostChange(e.target.value)}
          step="0.01"
          min="0"
          className="bg-background text-foreground"
          placeholder="e.g., 99.99"
        />
      </div>
    </>
  )
}