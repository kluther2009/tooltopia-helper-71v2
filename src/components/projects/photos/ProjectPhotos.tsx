import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { ProjectPhotosList } from "./ProjectPhotosList";
import { ProjectPhotoUploadDialog } from "./ProjectPhotoUploadDialog";
import { ProjectPhotoCameraDialog } from "./ProjectPhotoCameraDialog";

interface ProjectPhotosProps {
  projectId: string;
}

export function ProjectPhotos({ projectId }: ProjectPhotosProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);

  return (
    <div className="border-t border-slate-700 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300">Project Photos</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsUploadDialogOpen(true)}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCameraDialogOpen(true)}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
      </div>

      <ProjectPhotosList projectId={projectId} />

      <ProjectPhotoUploadDialog
        projectId={projectId}
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
      <ProjectPhotoCameraDialog
        projectId={projectId}
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
      />
    </div>
  );
}