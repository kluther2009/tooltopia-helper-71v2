import { Card } from "@/components/ui/card";
import { ToolList } from "@/components/ToolList";
import { Tool } from "@/hooks/useTools";
import { Image } from "lucide-react";
import { useState } from "react";
import { LocationPhotoViewer } from "./photos/LocationPhotoViewer";
import { Button } from "./ui/button";

interface LocationSectionProps {
  mainLocation: string;
  subLocations: { [key: string]: Tool[] };
  colorClass: string;
  isDraggingOver: string | null;
}

export function LocationSection({ 
  mainLocation, 
  subLocations, 
  colorClass,
  isDraggingOver 
}: LocationSectionProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  return (
    <Card className={`p-6 ${colorClass} border border-gray-200 bg-opacity-90 hover:bg-opacity-100 transition-all duration-200`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">{mainLocation}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white/80"
          onClick={() => setSelectedLocation(mainLocation)}
        >
          <Image className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid gap-6">
        {Object.entries(subLocations).map(([subLocation, locationTools]) => {
          const fullLocation = `${mainLocation}${subLocation !== "General" ? ` > ${subLocation}` : ''}`;
          return (
            <div key={`${mainLocation}-${subLocation}`}>
              <ToolList
                location={fullLocation}
                tools={locationTools}
                isDraggingOver={isDraggingOver === fullLocation}
              />
            </div>
          );
        })}
      </div>

      <LocationPhotoViewer
        location={selectedLocation}
        isOpen={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </Card>
  );
}