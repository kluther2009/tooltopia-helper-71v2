import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationPhotoManager } from "@/components/LocationPhotoManager";
import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { MoveToolDialog } from "@/components/MoveToolDialog";
import { useTools, Tool } from "@/hooks/useTools";
import { LocationSection } from "@/components/LocationSection";

const locationColors = [
  'bg-[#9b87f5]',
  'bg-[#F97316]',
  'bg-[#0EA5E9]',
  'bg-[#D946EF]',
  'bg-[#8B5CF6]',
];

interface GroupedTools {
  [location: string]: {
    [subLocation: string]: Tool[];
  };
}

interface DragConfirmation {
  toolId: string;
  destinationLocation: string;
  tool: Tool | null;
}

export default function Storage() {
  const { tools, fetchTools, updateToolLocation } = useTools();
  const [dragConfirmation, setDragConfirmation] = useState<DragConfirmation | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);

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
        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="tools">
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
                  <LocationSection
                    key={mainLocation}
                    mainLocation={mainLocation}
                    subLocations={subLocations}
                    colorClass={locationColors[index % locationColors.length]}
                    isDraggingOver={draggingOver}
                  />
                ))}
                {Object.keys(groupedTools).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No tools found.
                  </div>
                )}
              </div>
            </DragDropContext>
          </TabsContent>

          <TabsContent value="photos">
            <LocationPhotoManager />
          </TabsContent>
        </Tabs>

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