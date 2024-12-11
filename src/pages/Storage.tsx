import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DragDropContext } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { ToolList } from "@/components/ToolList";
import { MoveToolDialog } from "@/components/MoveToolDialog";
import { Card } from "@/components/ui/card";

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

interface GroupedTools {
  [location: string]: {
    [subLocation: string]: Tool[];
  };
}

// Array of background colors for main location cards
const locationColors = [
  'bg-[#9b87f5]',  // Primary Purple
  'bg-[#F97316]',  // Bright Orange
  'bg-[#0EA5E9]',  // Ocean Blue
  'bg-[#D946EF]',  // Magenta Pink
  'bg-[#8B5CF6]',  // Vivid Purple
];

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

  // Group tools by main location and sub-location
  const groupedTools = tools.reduce((acc: GroupedTools, tool) => {
    const [mainLocation, subLocation = "General"] = tool.location.split(" > ");
    
    if (!acc[mainLocation]) {
      acc[mainLocation] = {};
    }
    
    if (!acc[mainLocation][subLocation]) {
      acc[mainLocation][subLocation] = [];
    }
    
    acc[mainLocation][subLocation].push(tool);
    return acc;
  }, {});

  return (
    <Layout>
      <Card className="max-w-7xl mx-auto p-6 bg-white">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Storage Locations</h1>
        
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
            {Object.entries(groupedTools).map(([mainLocation, subLocations], index) => (
              <Card 
                key={mainLocation} 
                className={`p-6 ${locationColors[index % locationColors.length]} border border-gray-200 bg-opacity-90 hover:bg-opacity-100 transition-all duration-200`}
              >
                <h2 className="text-2xl font-semibold mb-6 text-white">{mainLocation}</h2>
                <div className="grid gap-6">
                  {Object.entries(subLocations).map(([subLocation, locationTools]) => (
                    <div key={`${mainLocation}-${subLocation}`}>
                      <ToolList
                        location={`${mainLocation}${subLocation !== "General" ? ` > ${subLocation}` : ''}`}
                        tools={locationTools}
                        isDraggingOver={draggingOver === `${mainLocation}${subLocation !== "General" ? ` > ${subLocation}` : ''}`}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
            {Object.keys(groupedTools).length === 0 && (
              <div className="text-center py-8 text-gray-500">
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
      </Card>
    </Layout>
  );
}