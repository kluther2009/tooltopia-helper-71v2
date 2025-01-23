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
      <DialogContent className="sm:max-w-md">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={onViewPhotos}
          >
            <Camera className="h-4 w-4" />
            View Photos
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={onUploadPhoto}
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}