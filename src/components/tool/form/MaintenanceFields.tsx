
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"

interface MaintenanceFieldsProps {
  lastMaintenanceDate: string | null
  maintenancePeriod: string | null
  onLastMaintenanceDateChange: (value: string | null) => void
  onMaintenancePeriodChange: (value: string) => void
}

export function MaintenanceFields({
  lastMaintenanceDate,
  maintenancePeriod,
  onLastMaintenanceDateChange,
  onMaintenancePeriodChange
}: MaintenanceFieldsProps) {
  // Convert string date to Date object for DatePicker
  const lastMaintenanceDateObj = lastMaintenanceDate ? new Date(lastMaintenanceDate) : undefined;
  
  // Handle date selection from DatePicker
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      onLastMaintenanceDateChange(formattedDate);
    } else {
      onLastMaintenanceDateChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="lastMaintenanceDate">Last Maintenance Date</Label>
        <DatePicker
          date={lastMaintenanceDateObj}
          onSelect={handleDateSelect}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="maintenancePeriod">Maintenance Period (months)</Label>
        <Input
          type="number"
          id="maintenancePeriod"
          min="0"
          value={maintenancePeriod || ""}
          onChange={(e) => onMaintenancePeriodChange(e.target.value)}
          placeholder="Enter number of months"
        />
      </div>
    </div>
  )
}
