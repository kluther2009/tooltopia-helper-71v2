
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LanguageSelectorProps {
  language: string;
  onSettingChange: (setting: string, value: string) => void;
}

export function LanguageSelector({ language, onSettingChange }: LanguageSelectorProps) {
  const { toast } = useToast();
  
  const handleLanguageClick = () => {
    toast({
      title: "Coming soon!",
      description: "Additional language options will be available in a future update.",
      duration: 3000
    });
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label>Language</Label>
        <p className="text-sm text-muted-foreground">
          Select your preferred language
        </p>
      </div>
      <Select
        value={language}
        onValueChange={(value) => onSettingChange("language", value)}
      >
        <SelectTrigger 
          className="w-[180px]"
          onClick={handleLanguageClick}
        >
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
  );
}
