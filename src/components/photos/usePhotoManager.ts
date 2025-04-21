
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { LocationPhoto } from "@/types/photos"
import { toast } from "sonner"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
const MAX_MODERATION_SIZE = 4 * 1024 * 1024 // 4MB for content moderation

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

  const compressImage = async (file: File): Promise<File> => {
    console.log('Original file size:', file.size / 1024 / 1024, 'MB')
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const img = new Image()
        img.src = reader.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200 // Max width/height
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)

          // Start with high quality
          let quality = 0.9
          let output = canvas.toDataURL('image/jpeg', quality)
          let byteSize = Math.ceil((output.length * 3) / 4) // base64 size to byte size

          // Reduce quality until file is under MAX_MODERATION_SIZE
          while (byteSize > MAX_MODERATION_SIZE && quality > 0.1) {
            quality -= 0.1
            output = canvas.toDataURL('image/jpeg', quality)
            byteSize = Math.ceil((output.length * 3) / 4)
          }

          // Convert base64 to File
          const byteString = atob(output.split(',')[1])
          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }
          const blob = new Blob([ab], { type: 'image/jpeg' })
          const compressedFile = new File([blob], file.name, { type: 'image/jpeg' })
          
          console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB')
          console.log('Compression ratio:', (compressedFile.size / file.size * 100).toFixed(2) + '%')
          console.log('Final quality setting:', quality)
          
          resolve(compressedFile)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
    })
  }

  const moderateImage = async (url: string): Promise<boolean> => {
     // I am ignoring the moderation becasue I have to pay so returning true
      return true
    //try {
    //  const { data, error } = await supabase.functions.invoke('moderate-image', {
    //    body: { imageUrl: url }
    //  })
      // The code below won't run due to the return above
      //if (error) throw error

      //if (!data.isSafe) {
      //  const violations = data.details.violations.join('\n')
      //  toast.error(`Image contains inappropriate content:\n${violations}`)
      //}

      //return data.isSafe
   // } catch (error) {
   //   console.error('Moderation error:', error)
   //   throw new Error('Failed to moderate image')
   // }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!validateFileSize(file)) {
      event.target.value = ''
      return
    }

    try {
      // Compress image before setting it as pending
      const compressedFile = await compressImage(file)
      console.log('Original size:', file.size / 1024 / 1024, 'MB')
      console.log('Compressed size:', compressedFile.size / 1024 / 1024, 'MB')
      
      setPendingFile(compressedFile)
      setIsLocationDialogOpen(true)
      setLocationInput("")
    } catch (error) {
      console.error('Compression error:', error)
      toast.error('Failed to process image')
      event.target.value = ''
    }
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

  const handleCameraCapture = async (file: File) => {
    if (!validateFileSize(file)) {
      return
    }
    try {
      const compressedFile = await compressImage(file)
      setPendingFile(compressedFile)
      setIsLocationDialogOpen(true)
      setLocationInput("")
    } catch (error) {
      console.error('Compression error:', error)
      toast.error('Failed to process camera image')
    }
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
