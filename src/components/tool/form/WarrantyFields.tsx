import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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
      <div className="space-y-2">
        <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
        <Input
          type="date"
          id="purchaseDate"
          value={purchaseDate}
          onChange={(e) => onPurchaseDateChange(e.target.value)}
          className="bg-background text-foreground"
        />
      </div>

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