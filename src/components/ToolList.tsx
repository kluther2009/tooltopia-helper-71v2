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
      className={`p-6 bg-card/50 transition-colors duration-200 ${
        isDraggingOver ? "bg-primary/10" : ""
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">{location}</h2>
      <ScrollArea className="h-[440px] w-full">
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