
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InitialInventoryViewer } from "@/components/photos/InitialInventoryViewer";
import { PhotoUploadForm } from "@/components/photos/upload/PhotoUploadForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ReplacePhotoDialog } from "@/components/photos/ReplacePhotoDialog";

export default function InitialInventory() {
  const [showReplacement, setShowReplacement] = useState(false);

  return (
    <Card className="max-w-7xl mx-auto p-6">
      <div className="flex-1">
        <Tabs defaultValue="view">
          <div className="flex items-center gap-4">
            <TabsList>
              <TabsTrigger value="view">View Photos</TabsTrigger>
              <TabsTrigger value="upload">Upload Photo</TabsTrigger>
            </TabsList>
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
        </Tabs>
      </div>

      <ReplacePhotoDialog 
        isOpen={showReplacement}
        onClose={() => setShowReplacement(false)}
      />
    </Card>
  );
}
