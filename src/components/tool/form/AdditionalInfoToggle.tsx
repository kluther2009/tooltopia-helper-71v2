import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface AdditionalInfoToggleProps {
  showAdditionalInfo: boolean
  onToggle: (checked: boolean) => void
}

export function AdditionalInfoToggle({
  showAdditionalInfo,
  onToggle
}: AdditionalInfoToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="show-additional-info"
        checked={showAdditionalInfo}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="show-additional-info">Add purchase and warranty information</Label>
    </div>
  )
}