import { ToolNameAutocomplete } from "@/components/ToolNameAutocomplete"
import { ToolLocationFields } from "@/components/ToolLocationFields"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface BasicToolInfoProps {
  toolName: string
  primaryLocation: string
  subLocation: string
  specificLocation: string
  status: string
  loanedTo?: string
  loanDate?: string
  toolNameInputRef: React.RefObject<HTMLInputElement>
  onToolNameChange: (value: string) => void
  onPrimaryLocationChange: (value: string) => void
  onSubLocationChange: (value: string) => void
  onSpecificLocationChange: (value: string) => void
  onStatusChange: (value: string) => void
  onLoanedToChange?: (value: string) => void
  onLoanDateChange?: (value: string) => void
  onExistingToolSelect?: (toolId: string) => void
}

export function BasicToolInfo({
  toolName,
  primaryLocation,
  subLocation,
  specificLocation,
  status,
  loanedTo = "",
  loanDate = "",
  toolNameInputRef,
  onToolNameChange,
  onPrimaryLocationChange,
  onSubLocationChange,
  onSpecificLocationChange,
  onStatusChange,
  onLoanedToChange,
  onLoanDateChange,
  onExistingToolSelect,
}: BasicToolInfoProps) {
  const [showLoanFields, setShowLoanFields] = useState(status === "loaned")

  useEffect(() => {
    setShowLoanFields(status === "loaned")
  }, [status])

  const handleStatusChange = (value: string) => {
    onStatusChange(value)
    if (value !== "loaned" && onLoanedToChange && onLoanDateChange) {
      onLoanedToChange("")
      onLoanDateChange("")
    }
  }

  return (
    <>
      <ToolNameAutocomplete
        value={toolName}
        onValueChange={onToolNameChange}
        inputRef={toolNameInputRef}
        onExistingToolSelect={onExistingToolSelect}
      />

      <ToolLocationFields
        primaryLocation={primaryLocation}
        subLocation={subLocation}
        specificLocation={specificLocation}
        onPrimaryLocationChange={onPrimaryLocationChange}
        onSubLocationChange={onSubLocationChange}
        onSpecificLocationChange={onSpecificLocationChange}
      />

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="bg-background text-foreground border-input">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-input">
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="loaned">Loaned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showLoanFields && (
        <>
          <div className="space-y-2">
            <Label htmlFor="loanedTo">Loaned To</Label>
            <Input
              id="loanedTo"
              value={loanedTo}
              onChange={(e) => onLoanedToChange?.(e.target.value)}
              placeholder="Enter borrower's name..."
              className="bg-background text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanDate">Loan Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !loanDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {loanDate ? format(new Date(loanDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={loanDate ? new Date(loanDate) : undefined}
                  onSelect={(date) => onLoanDateChange?.(date ? format(date, "yyyy-MM-dd") : "")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              id="loanDate"
              type="date"
              value={loanDate}
              onChange={(e) => onLoanDateChange?.(e.target.value)}
              className="bg-background text-foreground"
            />
          </div>
        </>
      )}
    </>
  )
}