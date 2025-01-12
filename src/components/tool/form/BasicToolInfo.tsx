import { ToolNameAutocomplete } from "@/components/ToolNameAutocomplete"
import { ToolLocationFields } from "@/components/ToolLocationFields"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BasicToolInfoProps {
  toolName: string
  primaryLocation: string
  subLocation: string
  specificLocation: string
  status: string
  toolNameInputRef: React.RefObject<HTMLInputElement>
  onToolNameChange: (value: string) => void
  onPrimaryLocationChange: (value: string) => void
  onSubLocationChange: (value: string) => void
  onSpecificLocationChange: (value: string) => void
  onStatusChange: (value: string) => void
  onExistingToolSelect?: (toolId: string) => void
}

export function BasicToolInfo({
  toolName,
  primaryLocation,
  subLocation,
  specificLocation,
  status,
  toolNameInputRef,
  onToolNameChange,
  onPrimaryLocationChange,
  onSubLocationChange,
  onSpecificLocationChange,
  onStatusChange,
  onExistingToolSelect,
}: BasicToolInfoProps) {
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
        <Select value={status} onValueChange={onStatusChange}>
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
    </>
  )
}