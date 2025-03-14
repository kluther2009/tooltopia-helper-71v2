
import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const countries = [
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "gb" },
  { label: "Canada", value: "ca" },
  { label: "Australia", value: "au" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "Italy", value: "it" },
  { label: "Spain", value: "es" },
  { label: "Netherlands", value: "nl" },
  { label: "Belgium", value: "be" },
  { label: "Switzerland", value: "ch" },
  { label: "Austria", value: "at" },
  { label: "Sweden", value: "se" },
  { label: "Norway", value: "no" },
  { label: "Denmark", value: "dk" },
  { label: "Finland", value: "fi" },
  { label: "Portugal", value: "pt" },
  { label: "Ireland", value: "ie" },
  { label: "Poland", value: "pl" },
  { label: "Japan", value: "jp" },
  { label: "China", value: "cn" },
  { label: "India", value: "in" },
  { label: "Brazil", value: "br" },
  { label: "Mexico", value: "mx" },
  { label: "South Africa", value: "za" },
  { label: "Russia", value: "ru" },
  { label: "South Korea", value: "kr" },
  { label: "New Zealand", value: "nz" },
  { label: "Singapore", value: "sg" },
  { label: "United Arab Emirates", value: "ae" },
  { label: "Thailand", value: "th" },
  { label: "Malaysia", value: "my" },
  { label: "Indonesia", value: "id" },
  { label: "Philippines", value: "ph" },
  { label: "Vietnam", value: "vn" },
  { label: "Turkey", value: "tr" },
  { label: "Greece", value: "gr" },
  { label: "Israel", value: "il" },
].sort((a, b) => a.label.localeCompare(b.label));

interface LanguageSectionProps {
  language: string;
  country: string;
  onSettingChange: (setting: string, value: boolean | string) => void;
}

export function LanguageSection({ 
  language, 
  country,
  onSettingChange 
}: LanguageSectionProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Language & Region</h2>
      </div>
      <div className="space-y-6">
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
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Country</Label>
            <p className="text-sm text-muted-foreground">
              Select your country or region
            </p>
          </div>
          <Select
            value={country}
            onValueChange={(value) => onSettingChange("country", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select country..." />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
