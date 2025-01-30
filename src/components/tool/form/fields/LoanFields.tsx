import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"

interface LoanFieldsProps {
  loanedTo: string | null
  loanDate: string | null
  onLoanedToChange: (value: string) => void
  onLoanDateChange: (value: string) => void
}

export function LoanFields({ 
  loanedTo, 
  loanDate, 
  onLoanedToChange, 
  onLoanDateChange 
}: LoanFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="loanedTo">Loaned To</Label>
        <Input
          id="loanedTo"
          value={loanedTo || ""}
          onChange={(e) => onLoanedToChange(e.target.value)}
          placeholder="Enter borrower's name"
          className="bg-background text-foreground"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="loanDate">Loan Date</Label>
        <DatePicker
          date={loanDate ? new Date(loanDate) : undefined}
          onSelect={(date) => onLoanDateChange(date ? date.toISOString().split('T')[0] : '')}
        />
      </div>
    </>
  )
}