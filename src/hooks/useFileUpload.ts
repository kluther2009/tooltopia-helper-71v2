import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File, toolId: string, fileType: 'warranty' | 'receipt') => {
    if (!file) return null
    
    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${toolId}/${fileType}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('warranty-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error(`Error uploading ${fileType} file:`, uploadError)
        toast.error(`Failed to upload ${fileType} file`)
        return null
      }

      return filePath
    } catch (error) {
      console.error(`Error in uploadFile:`, error)
      toast.error(`Failed to upload ${fileType} file`)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadFile,
    isUploading
  }
}