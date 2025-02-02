import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { CameraDialog } from "@/components/photos/CameraDialog";

export function PhotoUploadForm() {
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { handleFileSelect, handleCameraCapture, isUploading } = usePhotoUpload(location, subLocation);

  return (
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

      <CameraDialog
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}