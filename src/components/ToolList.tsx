import { ToolCard } from "@/components/ToolCard";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Tool {
  id: string;
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance";
}

interface ToolListProps {
  location: string;
  tools: Tool[];
  isDraggingOver?: boolean;
}

export function ToolList({ location, tools, isDraggingOver }: ToolListProps) {
  return (
    <Card 
      className={`p-4 bg-gray-200 border border-gray-300 transition-colors duration-200 ${
        isDraggingOver ? "bg-primary/5" : ""
      }`}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {location.includes(" > ") ? location.split(" > ")[1] : location}
      </h3>
      <ScrollArea className="h-auto max-h-[320px] w-full">
        <Droppable droppableId={location}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4"
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
                    >
                      <ToolCard
                        id={tool.id}
                        name={tool.name}
                        location={tool.location}
                        status={tool.status}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </ScrollArea>
    </Card>
  );
}