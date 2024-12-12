import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ToolNameAutocompleteProps {
  value: string
  onValueChange: (value: string) => void
}

export function ToolNameAutocomplete({ value, onValueChange }: ToolNameAutocompleteProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="toolName">Tool Name</Label>
      <Input
        id="toolName"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Enter tool name..."
        className="bg-background text-foreground"
        required
      />
    </div>
  )
}