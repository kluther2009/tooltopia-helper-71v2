import { Card } from "@/components/ui/card";
import { ToolList } from "@/components/ToolList";
import { Tool } from "@/hooks/useTools";

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
  return (
    <Card className={`p-6 ${colorClass} border border-gray-200 bg-opacity-90 hover:bg-opacity-100 transition-all duration-200`}>
      <h2 className="text-2xl font-semibold mb-6 text-white">{mainLocation}</h2>
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
    </Card>
  );
}