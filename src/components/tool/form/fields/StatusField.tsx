import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StatusFieldProps {
  status: string
  onStatusChange: (value: string) => void
}

export function StatusField({ status, onStatusChange }: StatusFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select 
        value={status} 
        onValueChange={onStatusChange}
      >
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
  )
}