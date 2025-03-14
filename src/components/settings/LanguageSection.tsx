
import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  { label: "Japan", value: "jp" },
  { label: "China", value: "cn" },
  { label: "India", value: "in" },
  { label: "Brazil", value: "br" },
  { label: "Mexico", value: "mx" },
  { label: "South Africa", value: "za" },
  { label: "Russia", value: "ru" },
  { label: "South Korea", value: "kr" },
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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[180px] justify-between"
              >
                {country
                  ? countries.find((c) => c.value === country)?.label
                  : "Select country..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {countries.map((c) => (
                    <CommandItem
                      key={c.value}
                      value={c.value}
                      onSelect={(currentValue) => {
                        onSettingChange("country", currentValue);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          country === c.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {c.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
}
