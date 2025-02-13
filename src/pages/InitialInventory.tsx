
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InitialInventoryViewer } from "@/components/photos/InitialInventoryViewer";
import { PhotoUploadForm } from "@/components/photos/upload/PhotoUploadForm";
import { PhotoReplacementDialog } from "@/components/photos/replacement/PhotoReplacementDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function InitialInventory() {
  const [isReplacementOpen, setIsReplacementOpen] = useState(false);

  return (
    <Card className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Tabs defaultValue="view" className="flex-1">
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
        
        <Button 
          variant="outline" 
          onClick={() => setIsReplacementOpen(true)}
          className="ml-4"
        >
          Replace Old Photo
        </Button>
      </div>

      <PhotoReplacementDialog
        open={isReplacementOpen}
        onOpenChange={setIsReplacementOpen}
      />
    </Card>
  );
}
