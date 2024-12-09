import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DragDropContext } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { ToolList } from "@/components/ToolList";
import { MoveToolDialog } from "@/components/MoveToolDialog";

interface Tool {
  id: string;
  name: string;
  location: string;
  status: "available" | "in-use" | "maintenance";
}

interface DragConfirmation {
  toolId: string;
  destinationLocation: string;
  tool: Tool | null;
}

export default function Storage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const { toast } = useToast();
  const [dragConfirmation, setDragConfirmation] = useState<DragConfirmation | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);

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

  const handleDragEnd = async (result: any) => {
    setDraggingOver(null);
    if (!result.destination) return;

    const sourceLocation = result.source.droppableId;
    const destinationLocation = result.destination.droppableId;
    
    if (sourceLocation === destinationLocation) return;

    const toolId = result.draggableId;
    const tool = tools.find(t => t.id === toolId);
    
    if (!tool) return;

    if (tool.location.includes(">")) {
      setDragConfirmation({
        toolId,
        destinationLocation,
        tool
      });
      return;
    }

    await updateToolLocation(toolId, destinationLocation);
  };

  const updateToolLocation = async (toolId: string, destinationLocation: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

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

    fetchTools();
  };

  const groupedTools = tools.reduce((acc, tool) => {
    const primaryLocation = tool.location.split(" > ")[0];
    if (!acc[primaryLocation]) {
      acc[primaryLocation] = [];
    }
    acc[primaryLocation].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Storage Locations</h1>
        
        <DragDropContext 
          onDragEnd={handleDragEnd}
          onDragUpdate={(update) => {
            if (update.destination) {
              setDraggingOver(update.destination.droppableId);
            } else {
              setDraggingOver(null);
            }
          }}
        >
          <div className="space-y-8">
            {Object.entries(groupedTools).map(([location, locationTools]) => (
              <div key={location}>
                <ToolList
                  location={location}
                  tools={locationTools}
                  isDraggingOver={draggingOver === location}
                />
              </div>
            ))}
            {Object.keys(groupedTools).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No tools found.
              </div>
            )}
          </div>
        </DragDropContext>

        <MoveToolDialog
          isOpen={!!dragConfirmation}
          onClose={() => setDragConfirmation(null)}
          onConfirm={() => {
            if (dragConfirmation) {
              updateToolLocation(dragConfirmation.toolId, dragConfirmation.destinationLocation);
              setDragConfirmation(null);
            }
          }}
        />
      </div>
    </Layout>
  );
}