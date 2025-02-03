import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { LocationPhoto } from "@/types/photos"
import { toast } from "sonner"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

export function usePhotoManager() {
  const [photos, setPhotos] = useState<LocationPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<LocationPhoto | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [locationInput, setLocationInput] = useState("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getCurrentUser()
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('location_photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch photos')
      return
    }

    setPhotos(data)
  }

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 5MB limit')
      return false
    }
    return true
  }

  const moderateImage = async (url: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-image', {
        body: { imageUrl: url }
      })

      if (error) throw error

      if (!data.isSafe) {
        const violations = data.details.violations.join('\n')
        toast.error(
          <div className="space-y-2">
            <p>Image contains inappropriate content:</p>
            <p className="text-sm text-red-500">{violations}</p>
          </div>
        )
      }

      return data.isSafe
    } catch (error) {
      console.error('Moderation error:', error)
      throw new Error('Failed to moderate image')
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!validateFileSize(file)) {
      event.target.value = ''
      return
    }

    setPendingFile(file)
    setIsLocationDialogOpen(true)
    setLocationInput("")
  }

  const handleUploadConfirm = async (location: string) => {
    if (!pendingFile || !location.trim() || !userId) {
      toast.error('Please provide a location name')
      return
    }

    setIsLocationDialogOpen(false)
    setIsUploading(true)

    try {
      const fileExt = pendingFile.name.split('.').pop()
      const tempPath = `temp/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage
        .from('location-photos')
        .upload(tempPath, pendingFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('location-photos')
        .getPublicUrl(tempPath)

      const isSafe = await moderateImage(publicUrl)

      if (!isSafe) {
        await supabase.storage
          .from('location-photos')
          .remove([tempPath])
        
        toast.error('Image contains inappropriate content')
        return
      }

      const finalPath = `${crypto.randomUUID()}.${fileExt}`
      const { error: moveError } = await supabase.storage
        .from('location-photos')
        .move(tempPath, finalPath)

      if (moveError) throw moveError

      const { error: dbError } = await supabase
        .from('location_photos')
        .insert({
          location: location.trim(),
          file_path: finalPath,
          user_id: userId
        })

      if (dbError) throw dbError

      toast.success('Photo uploaded successfully')
      fetchPhotos()
    } catch (error) {
      toast.error('Failed to upload photo')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setPendingFile(null)
      setLocationInput("")
    }
  }

  const handleDeletePhoto = async (photo: LocationPhoto) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('location-photos')
        .remove([photo.file_path])

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('location_photos')
        .delete()
        .eq('id', photo.id)

      if (dbError) throw dbError

      toast.success('Photo deleted successfully')
      fetchPhotos()
    } catch (error) {
      toast.error('Failed to delete photo')
      console.error('Delete error:', error)
    }
  }

  const handleCameraCapture = (file: File) => {
    if (!validateFileSize(file)) {
      return
    }
    setPendingFile(file)
    setIsLocationDialogOpen(true)
    setLocationInput("")
  }

  return {
    photos,
    selectedPhoto,
    isUploading,
    isViewerOpen,
    isLocationDialogOpen,
    locationInput,
    isCameraOpen,
    setSelectedPhoto,
    setIsViewerOpen,
    setIsLocationDialogOpen,
    setLocationInput,
    setIsCameraOpen,
    handleFileSelect,
    handleUploadConfirm,
    handleDeletePhoto,
    handleCameraCapture
  }
}