
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InitialInventoryViewer } from "@/components/photos/InitialInventoryViewer";
import { PhotoUploadForm } from "@/components/photos/upload/PhotoUploadForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function InitialInventory() {
  const [showReplacement, setShowReplacement] = useState(false);

  return (
    <Card className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Tabs defaultValue="view" className="flex-1">
          <TabsList>
            <TabsTrigger value="view">View Photos</TabsTrigger>
            <TabsTrigger value="upload">Upload Photo</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button 
          variant="outline"
          onClick={() => setShowReplacement(true)}
        >
          Replace Old Photo
        </Button>
      </div>

      <TabsContent value="view">
        <InitialInventoryViewer />
      </TabsContent>

      <TabsContent value="upload">
        <PhotoUploadForm />
      </TabsContent>
    </Card>
  );
}
