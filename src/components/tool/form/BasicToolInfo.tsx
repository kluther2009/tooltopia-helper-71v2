import { ToolNameAutocomplete } from "@/components/ToolNameAutocomplete"
import { ToolLocationFields } from "@/components/ToolLocationFields"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
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
            <DatePicker
              date={loanDate ? new Date(loanDate) : undefined}
              onSelect={(date) => onLoanDateChange?.(date ? date.toISOString().split('T')[0] : '')}
            />
          </div>
        </>
      )}
    </>
  )
}