import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Tool } from "@/hooks/useTools";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LocationSectionProps {
  mainLocation: string;
  mainLocationTools: Tool[];
  subLocations: {
    [key: string]: Tool[];
  };
  colorClass: string;
  isDraggingOver: string | null;
  onEditTool: (toolId: string) => void;
}

export function LocationSection({
  mainLocation,
  mainLocationTools,
  subLocations,
  colorClass,
  isDraggingOver,
  onEditTool
}: LocationSectionProps) {
  const navigate = useNavigate();

  const renderTool = (tool: Tool, index: number) => (
    <Draggable key={tool.id} draggableId={tool.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "flex items-center justify-between p-2 mb-2 bg-white rounded shadow",
            isDraggingOver === mainLocation && "border-2 border-dashed border-gray-300"
          )}
        >
          <span>{tool.name}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditTool(tool.id)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="space-y-4">
      <div className={cn("p-4 rounded-lg", colorClass)}>
        <h2 className="text-xl font-semibold text-white mb-4">{mainLocation}</h2>
        <Droppable droppableId={mainLocation}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {mainLocationTools.map((tool, index) => renderTool(tool, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {Object.entries(subLocations).map(([subLocation, tools]) => (
          <div key={subLocation} className="mt-4">
            <h3 className="text-lg font-medium text-white mb-2">{subLocation}</h3>
            <Droppable droppableId={`${mainLocation}>${subLocation}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {tools.map((tool, index) => renderTool(tool, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </div>
  );
}