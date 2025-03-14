
import { Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { CountrySelector } from "./CountrySelector";
import { PostcodeField } from "./PostcodeField";

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
  const [postcode, setPostcode] = useState(() => {
    const savedSettings = localStorage.getItem('toolTrackerSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.postcode || '';
    }
    return '';
  });
  
  // Update local state when postcode changes
  const handlePostcodeChange = (setting: string, value: string) => {
    setPostcode(value);
    onSettingChange(setting, value);
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Language & Region</h2>
      </div>
      <div className="space-y-6">
        <LanguageSelector 
          language={language} 
          onSettingChange={onSettingChange} 
        />
        
        <CountrySelector 
          country={country} 
          onSettingChange={onSettingChange}
        />

        <PostcodeField 
          postcode={postcode} 
          country={country}
          onSettingChange={handlePostcodeChange}
        />
      </div>
    </Card>
  );
}
