import { ToolCard } from "@/components/ToolCard";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tool } from "@/hooks/useTools";

interface ToolListProps {
  location: string;
  tools: Tool[];
  isDraggingOver?: boolean;
}

export function ToolList({ location, tools, isDraggingOver }: ToolListProps) {
  const locationTitle = location.includes(" > ") ? location.split(" > ")[1] : location;

  return (
    <Card 
      className={`p-4 bg-white/50 backdrop-blur-sm border border-gray-200 shadow-sm transition-colors duration-200 ${
        isDraggingOver ? "bg-primary/5" : ""
      }`}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {locationTitle}
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
                      <ToolCard {...tool} />
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