import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InitialInventoryViewer } from "@/components/photos/InitialInventoryViewer";
import { PhotoUploadForm } from "@/components/photos/upload/PhotoUploadForm";

export default function InitialInventory() {
  return (
    <Card className="max-w-7xl mx-auto p-6">
      <Tabs defaultValue="view" className="space-y-6">
        <TabsList>
          <TabsTrigger value="view">View Photos</TabsTrigger>
          <TabsTrigger value="upload">Upload Photo</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <InitialInventoryViewer />
        </TabsContent>

        <TabsContent value="upload">
          <PhotoUploadForm />
        </TabsContent>
      </Tabs>
    </Card>
  );
}