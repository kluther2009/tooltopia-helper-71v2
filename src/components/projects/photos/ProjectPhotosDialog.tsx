import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { CameraDialog } from "@/components/photos/CameraDialog"
import { ProjectPhotosViewer } from "./ProjectPhotosViewer"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      console.log('Starting photo upload for project:', projectId)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to upload photos')
        return
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${projectId}/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        toast.error('Failed to upload photo')
        return
      }

      const { error: dbError } = await supabase
        .from('project_photos')
        .insert({
          project_id: projectId,
          file_path: filePath,
          user_id: user.id
        })

      if (dbError) {
        console.error('Error saving to database:', dbError)
        toast.error('Failed to save photo information')
        return
      }

      toast.success('Photo uploaded successfully')
      onUploadPhoto()
    } catch (error) {
      console.error('Error in handleFileSelect:', error)
      toast.error('Failed to upload photo')
    }
  }

  const handleCameraCapture = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to upload photos')
        return
      }

      const fileExt = 'jpg'
      const filePath = `${projectId}/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading camera photo:', uploadError)
        toast.error('Failed to upload photo')
        return
      }

      const { error: dbError } = await supabase
        .from('project_photos')
        .insert({
          project_id: projectId,
          file_path: filePath,
          user_id: user.id
        })

      if (dbError) {
        console.error('Error saving camera photo to database:', dbError)
        toast.error('Failed to save photo information')
        return
      }

      toast.success('Photo captured and uploaded successfully')
      onUploadPhoto()
    } catch (error) {
      console.error('Error in handleCameraCapture:', error)
      toast.error('Failed to upload photo')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle>Project Photos</DialogTitle>
            <DialogDescription>
              View, upload, or take new photos for your project.
            </DialogDescription>
          </DialogHeader>
          <div className="max-w-2xl mx-auto">
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