import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { CameraDialog } from "@/components/photos/CameraDialog"
import { ProjectPhotosViewer } from "./ProjectPhotosViewer"

interface ProjectPhotosDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewPhotos: () => void
  onUploadPhoto: () => void
}

export function ProjectPhotosDialog({
  projectId,
  open,
  onOpenChange,
  onViewPhotos,
  onUploadPhoto,
}: ProjectPhotosDialogProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    onUploadPhoto()
  }

  const handleCameraCapture = (file: File) => {
    onUploadPhoto()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl mx-auto">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Project Photos</h2>
            <div className="space-y-4">
              <div className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onOpenChange(false);
                    setIsViewerOpen(true);
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  View Photos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => document.getElementById('project-photo-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsCameraOpen(true)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Input
                  id="project-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProjectPhotosViewer
        projectId={projectId}
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
      />

      <CameraDialog
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  )
}