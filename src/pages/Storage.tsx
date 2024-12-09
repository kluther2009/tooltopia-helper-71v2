import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useToast } from "@/components/ui/use-toast";

interface Tool {
  id: string;
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance";
}

export default function Storage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const { toast } = useToast();

  const fetchTools = async () => {
    const { data } = await supabase
      .from('tools')
      .select('*');
    
    if (data) {
      const transformedTools = data.map(tool => ({
        id: tool.id,
        name: tool.name,
        location: `${tool.location}${tool.sub_location_a ? ` > ${tool.sub_location_a}` : ''}${tool.sub_location_b ? ` > ${tool.sub_location_b}` : ''}`,
        status: tool.status as "available" | "in-use" | "maintenance"
      }));
      setTools(transformedTools);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const groupedTools = tools.reduce((acc, tool) => {
    const primaryLocation = tool.location.split(" > ")[0];
    if (!acc[primaryLocation]) {
      acc[primaryLocation] = [];
    }
    acc[primaryLocation].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceLocation = result.source.droppableId;
    const destinationLocation = result.destination.droppableId;
    
    if (sourceLocation === destinationLocation) return;

    const toolId = result.draggableId;
    const tool = tools.find(t => t.id === toolId);
    
    if (!tool) return;

    // Keep any sub-locations from the original location
    const locationParts = tool.location.split(" > ");
    const subLocationA = locationParts[1] || null;
    const subLocationB = locationParts[2] || null;

    const { error } = await supabase
      .from('tools')
      .update({ 
        location: destinationLocation,
        sub_location_a: subLocationA,
        sub_location_b: subLocationB
      })
      .eq('id', toolId);

    if (error) {
      console.error('Error updating tool location:', error);
      toast({
        title: "Error",
        description: "Failed to update tool location",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Moved ${tool.name} to ${destinationLocation}`,
    });

    // Refresh the tools list
    fetchTools();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Storage Locations</h1>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-8">
            {Object.entries(groupedTools).map(([location, locationTools]) => (
              <Droppable key={location} droppableId={location}>
                {(provided) => (
                  <Card 
                    className="p-6 bg-card/50"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h2 className="text-xl font-semibold mb-4">{location}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {locationTools.map((tool, index) => (
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
                  </Card>
                )}
              </Droppable>
            ))}
            {Object.keys(groupedTools).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No tools found.
              </div>
            )}
          </div>
        </DragDropContext>
      </div>
    </Layout>
  );
}