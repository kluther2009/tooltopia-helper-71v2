
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PostcodeFieldProps {
  postcode: string;
  country: string;
  onSettingChange: (setting: string, value: string) => void;
}

export function PostcodeField({ postcode, country, onSettingChange }: PostcodeFieldProps) {
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  
  // Validate postcode based on country selection
  useEffect(() => {
    setPostcodeError(null);
    if (postcode.trim() === '') return;
    
    // Reset validation when country changes
    validatePostcode(postcode);
  }, [country, postcode]);
  
  const validatePostcode = (value: string) => {
    setPostcodeError(null);
    
    // Basic validation only if a value is entered (field is optional)
    if (value.trim() === '') return true;
    
    // Basic country-specific validation
    switch(country) {
      case 'us': // United States
        if (!/^\d{1,5}$/.test(value)) {
          setPostcodeError('US ZIP should be 1-5 digits');
          return false;
        }
        break;
      case 'gb': // United Kingdom
        if (!/^[A-Z]{1,2}[0-9]{1,2}([A-Z])?$/i.test(value)) {
          setPostcodeError('UK postcode should start with area code');
          return false;
        }
        break;
      case 'ca': // Canada
        if (!/^[A-Z][0-9][A-Z]?$/i.test(value)) {
          setPostcodeError('CA postcode format: A1A');
          return false;
        }
        break;
      default:
        // For other countries, just ensure some content
        if (value.length < 2 || value.length > 8) {
          setPostcodeError('Postcode should be 2-8 characters');
          return false;
        }
    }
    
    return true;
  };
  
  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only store value if validation passes
    if (validatePostcode(value)) {
      onSettingChange("postcode", value);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label>Postcode Area</Label>
        <p className="text-sm text-muted-foreground">
          Enter part of your postcode to find nearby stores
        </p>
      </div>
      <div className="flex flex-col">
        <Input 
          className={cn("w-[180px]", postcodeError && "border-red-500")} 
          placeholder="e.g. SW1, 10001"
          value={postcode}
          onChange={handlePostcodeChange}
          maxLength={8}
          aria-invalid={!!postcodeError}
        />
        {postcodeError && (
          <p className="text-xs text-red-500 mt-1">{postcodeError}</p>
        )}
      </div>
    </div>
  );
}
