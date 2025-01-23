import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Upload } from "lucide-react"

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
  return (
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
                onClick={onViewPhotos}
              >
                <Camera className="h-4 w-4 mr-2" />
                View Photos
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onUploadPhoto}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}