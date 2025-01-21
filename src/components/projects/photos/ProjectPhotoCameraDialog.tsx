import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProjectPhotoCameraDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectPhotoCameraDialog({
  projectId,
  open,
  onOpenChange,
}: ProjectPhotoCameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const queryClient = useQueryClient();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    setIsCapturing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(videoRef.current, 0, 0);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg");
      });

      const filePath = `${projectId}/${Math.random()}.jpg`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("project-photos")
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase
        .from("project_photos")
        .insert({
          project_id: projectId,
          file_path: filePath,
        });

      if (dbError) throw dbError;

      toast.success("Photo captured successfully");
      queryClient.invalidateQueries({ queryKey: ["project-photos", projectId] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Failed to capture photo");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) stopCamera();
        onOpenChange(isOpen);
      }}
      onOpenAutoFocus={() => startCamera()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Take Photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCapture}
              disabled={!stream || isCapturing}
            >
              <Camera className="h-4 w-4 mr-2" />
              {isCapturing ? "Capturing..." : "Capture"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}