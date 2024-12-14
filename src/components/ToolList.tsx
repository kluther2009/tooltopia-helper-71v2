import { ToolCard } from "@/components/ToolCard";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Tool } from "@/hooks/useTools";

interface ToolListProps {
  location: string;
  tools: Tool[];
  isDraggingOver?: boolean;
  showLocationTitle?: boolean;
}

export function ToolList({ location, tools, isDraggingOver, showLocationTitle = true }: ToolListProps) {
  const locationTitle = location.includes(" > ") ? location.split(" > ")[1] : location;

  return (
    <Card 
      className={`p-4 bg-white/50 backdrop-blur-sm border border-gray-200 shadow-sm transition-colors duration-200 ${
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
            className="flex flex-wrap gap-4"
          >
            {tools.map((tool, index) => (
              <Draggable 
                key={tool.id} 
                draggableId={tool.id} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      width: 'calc(33.333% - 1rem)',
                      minWidth: '250px',
                      flex: '1 0 auto'
                    }}
                    className={`transition-opacity ${snapshot.isDragging ? 'opacity-75 z-50' : ''}`}
                  >
                    <ToolCard {...tool} />
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