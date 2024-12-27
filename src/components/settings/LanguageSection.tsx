import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LanguageSectionProps {
  language: string;
  onSettingChange: (setting: string, value: boolean | string) => void;
}

export function LanguageSection({ 
  language, 
  onSettingChange 
}: LanguageSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Language & Region</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Language</Label>
            <p className="text-sm text-muted-foreground">
              Select your preferred language
            </p>
          </div>
          <Select
            value={language}
            onValueChange={(value) =>
              onSettingChange("language", value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}