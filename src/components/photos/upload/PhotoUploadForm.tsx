
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Camera, CheckCircle2 } from "lucide-react";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { CameraDialog } from "@/components/photos/CameraDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PhotoUploadForm() {
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const { handleFileSelect: originalHandleFileSelect, handleCameraCapture: originalHandleCameraCapture, isUploading } = usePhotoUpload(location, subLocation);

  // Clear upload success message after 3 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  // Wrap the original handlers to show success message
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await originalHandleFileSelect(event);
      // Only show success if a file was actually selected
      if (event.target.files?.length) {
        setUploadSuccess(true);
        // Clear the input for next upload
        event.target.value = '';
      }
    } catch (error) {
      console.error("Error in handleFileSelect wrapper:", error);
    }
  };

  const handleCameraCapture = async (file: File) => {
    try {
      await originalHandleCameraCapture(file);
      setUploadSuccess(true);
      setIsCameraOpen(false);
    } catch (error) {
      console.error("Error in handleCameraCapture wrapper:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Initial Inventory Photo</h2>
      
      <div className="space-y-4">
        {uploadSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
            <AlertDescription>
              Photo uploaded successfully! You can upload more photos.
            </AlertDescription>
          </Alert>
        )}

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
