import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !purchaseDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {purchaseDate ? format(new Date(purchaseDate), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={purchaseDate ? new Date(purchaseDate) : undefined}
              onSelect={(date) => onPurchaseDateChange(date ? format(date, "yyyy-MM-dd") : "")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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