
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import { CameraDialog } from "@/components/photos/CameraDialog"
import { ProjectPhotosViewer } from "./ProjectPhotosViewer"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

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
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Clear upload success message after 3 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [uploadSuccess])

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 5MB limit')
      return false
    }
    return true
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!validateFileSize(file)) {
      event.target.value = ''
      return
    }

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

      // Show success message but don't close dialog
      setUploadSuccess(true)
      toast.success('Photo uploaded successfully')
      onUploadPhoto()
      
      // Clear the file input for the next upload
      event.target.value = ''
    } catch (error) {
      console.error('Error in handleFileSelect:', error)
      toast.error('Failed to upload photo')
    }
  }

  const handleCameraCapture = async (file: File) => {
    if (!validateFileSize(file)) {
      return
    }

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

      // Show success message but don't close dialog
      setUploadSuccess(true)
      toast.success('Photo captured and uploaded successfully')
      onUploadPhoto()
      
      // Close camera dialog after successful capture
      setIsCameraOpen(false)
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
              View or upload photos for your project.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="view" className="space-y-6">
            <TabsList>
              <TabsTrigger value="view">View Photos</TabsTrigger>
              <TabsTrigger value="upload">Upload Photo</TabsTrigger>
            </TabsList>

            <TabsContent value="view">
              <ProjectPhotosViewer projectId={projectId} open={true} onOpenChange={() => {}} />
            </TabsContent>

            <TabsContent value="upload">
              <div className="space-y-4">
                {uploadSuccess && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <AlertDescription>
                      Photo uploaded successfully! You can upload more photos.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="pt-4 flex gap-2">
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
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CameraDialog
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  )
}
