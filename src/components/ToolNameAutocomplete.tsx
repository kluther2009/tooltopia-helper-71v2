import { Input } from "@/components/ui/input"
import { FormItem, FormLabel } from "@/components/ui/form"

interface ToolNameAutocompleteProps {
  value: string
  onValueChange: (value: string) => void
}

export function ToolNameAutocomplete({ value, onValueChange }: ToolNameAutocompleteProps) {
  return (
    <FormItem className="space-y-2">
      <FormLabel htmlFor="toolName">Tool Name</FormLabel>
      <Input
        id="toolName"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Enter tool name..."
        className="bg-background text-foreground border-input"
      />
    </FormItem>
  )
}