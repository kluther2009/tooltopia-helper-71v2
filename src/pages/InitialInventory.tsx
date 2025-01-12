import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InitialInventoryViewer } from "@/components/photos/InitialInventoryViewer";
import { CameraDialog } from "@/components/photos/CameraDialog";

export default function InitialInventory() {
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('location-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('location_photos')
        .insert({
          location: location.trim(),
          sub_location: subLocation.trim() || null,
          file_path: filePath,
          user_id: user.id,
          is_initial_inventory: true
        });

      if (dbError) throw dbError;

      toast.success('Photo uploaded successfully');
      setLocation("");
      setSubLocation("");
      
      // Reset the file input
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = async (file: File) => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const fileExt = 'jpg';
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('location-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('location_photos')
        .insert({
          location: location.trim(),
          sub_location: subLocation.trim() || null,
          file_path: filePath,
          user_id: user.id,
          is_initial_inventory: true
        });

      if (dbError) throw dbError;

      toast.success('Photo captured and uploaded successfully');
      setLocation("");
      setSubLocation("");
    } catch (error) {
      console.error('Camera capture error:', error);
      toast.error('Failed to upload captured photo');
    } finally {
      setIsUploading(false);
    }
  };

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
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Upload Initial Inventory Photo</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location name"
                  disabled={isUploading}
                />
              </div>

              <div>
                <Label htmlFor="subLocation">Sub Location (Optional)</Label>
                <Input
                  id="subLocation"
                  value={subLocation}
                  onChange={(e) => setSubLocation(e.target.value)}
                  placeholder="Enter sub location name"
                  disabled={isUploading}
                />
              </div>

              <div className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={isUploading}
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={isUploading}
                  onClick={() => setIsCameraOpen(true)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CameraDialog
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </Card>
  );
}