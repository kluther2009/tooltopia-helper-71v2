import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MaintenanceFieldsProps {
  lastMaintenanceDate: string
  maintenancePeriod: string
  onLastMaintenanceDateChange: (value: string) => void
  onMaintenancePeriodChange: (value: string) => void
}

export function MaintenanceFields({
  lastMaintenanceDate,
  maintenancePeriod,
  onLastMaintenanceDateChange,
  onMaintenancePeriodChange
}: MaintenanceFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="lastMaintenanceDate">Last Maintenance Date</Label>
        <Input
          type="date"
          id="lastMaintenanceDate"
          value={lastMaintenanceDate}
          onChange={(e) => onLastMaintenanceDateChange(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="maintenancePeriod">Maintenance Period (months)</Label>
        <Input
          type="number"
          id="maintenancePeriod"
          min="0"
          value={maintenancePeriod}
          onChange={(e) => onMaintenancePeriodChange(e.target.value)}
          placeholder="Enter number of months"
        />
      </div>
    </div>
  )
}