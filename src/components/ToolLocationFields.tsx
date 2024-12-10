import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ToolLocationFieldsProps {
  primaryLocation: string
  subLocation: string
  specificLocation: string
  onPrimaryLocationChange: (value: string) => void
  onSubLocationChange: (value: string) => void
  onSpecificLocationChange: (value: string) => void
}

export function ToolLocationFields({
  primaryLocation,
  subLocation,
  specificLocation,
  onPrimaryLocationChange,
  onSubLocationChange,
  onSpecificLocationChange,
}: ToolLocationFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="primaryLocation">Primary Location</Label>
        <Input
          id="primaryLocation"
          value={primaryLocation}
          onChange={(e) => onPrimaryLocationChange(e.target.value)}
          placeholder="e.g., Workshop"
          className="bg-background text-foreground"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subLocation">Sub Location (Optional)</Label>
        <Input
          id="subLocation"
          value={subLocation}
          onChange={(e) => onSubLocationChange(e.target.value)}
          placeholder="e.g., Cabinet A"
          className="bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specificLocation">Specific Location (Optional)</Label>
        <Input
          id="specificLocation"
          value={specificLocation}
          onChange={(e) => onSpecificLocationChange(e.target.value)}
          placeholder="e.g., Top Shelf"
          className="bg-background text-foreground"
        />
      </div>
    </>
  )
}