
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface NotificationsSectionProps {
  emailNotifications: boolean;
  highlightExpiringWarranties: boolean;
  onSettingChange: (setting: string, value: boolean | string) => void;
}

export function NotificationsSection({ 
  emailNotifications, 
  highlightExpiringWarranties,
  onSettingChange 
}: NotificationsSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Notifications</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications about tool status changes
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={(checked) =>
              onSettingChange("emailNotifications", checked)
            }
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Highlight Expiring Warranties</Label>
            <p className="text-sm text-muted-foreground">
              Highlight tools with less than 1 month warranty remaining
            </p>
          </div>
          <Switch
            checked={highlightExpiringWarranties}
            onCheckedChange={(checked) =>
              onSettingChange("highlightExpiringWarranties", checked)
            }
          />
        </div>
      </div>
    </Card>
  );
}
