import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ToolNameFieldProps {
  toolName: string
  onToolNameChange: (value: string) => void
}

export function ToolNameField({ toolName, onToolNameChange }: ToolNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="toolName">Tool Name</Label>
      <Input
        id="toolName"
        value={toolName}
        onChange={(e) => onToolNameChange(e.target.value.slice(0, 50))}
        placeholder="Enter tool name"
        className="bg-background text-foreground"
        required
        maxLength={50}
      />
    </div>
  )
}