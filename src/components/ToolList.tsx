import { ToolCard } from "@/components/ToolCard";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Tool } from "@/hooks/useTools";

interface ToolListProps {
  location: string;
  tools: Tool[];
  isDraggingOver?: boolean;
  showLocationTitle?: boolean;
  onEditTool?: (toolId: string) => void;
}

export function ToolList({ 
  location, 
  tools, 
  isDraggingOver, 
  showLocationTitle = true,
  onEditTool 
}: ToolListProps) {
  const locationTitle = location.includes(" > ") ? location.split(" > ")[1] : location;

  return (
    <Card 
      className={`p-4 bg-white/50 backdrop-blur-sm border-2 border-black shadow-sm transition-colors duration-200 ${
        isDraggingOver ? "bg-primary/5" : ""
      }`}
    >
      {showLocationTitle && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {locationTitle}
        </h3>
      )}
      <Droppable droppableId={location}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {tools.map((tool, index) => (
              <Draggable 
                key={tool.id} 
                draggableId={tool.id} 
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <ToolCard 
                      {...tool}
                      name={tool.name}
                      location={tool.location}
                      onEdit={onEditTool ? () => onEditTool(tool.id) : undefined}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );
}