import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface ToolSubmissionData {
  toolName: string
  primaryLocation: string
  subLocation: string
  specificLocation: string
  status: string
  loanedTo: string | null
  loanDate: string | null
  showAdditionalInfo: boolean
  purchaseDate: string
  warrantyLength: string
  purchaseCost: string
  warrantyFile: File | null
  receiptFile: File | null
  annotationData?: any
}

export function useToolSubmission() {
  const [isUploading, setIsUploading] = useState(false)

  const handleToolSubmission = async (data: ToolSubmissionData): Promise<boolean> => {
    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to create tools")
        return false
      }

      // Upload warranty file if exists
      let warrantyFilePath = null
      if (data.warrantyFile) {
        const warrantyResult = await uploadFile(data.warrantyFile, 'warranty')
        if (!warrantyResult.success) return false
        warrantyFilePath = warrantyResult.path
      }

      // Upload receipt file if exists
      let receiptFilePath = null
      if (data.receiptFile) {
        const receiptResult = await uploadFile(data.receiptFile, 'receipt')
        if (!receiptResult.success) return false
        receiptFilePath = receiptResult.path
      }

      // Create the tool
      const { data: newTool, error: toolError } = await supabase
        .from('tools')
        .insert({
          name: data.toolName,
          location: data.primaryLocation,
          sub_location_a: data.subLocation || null,
          sub_location_b: data.specificLocation || null,
          status: data.status,
          loaned_to: data.loanedTo,
          loan_date: data.loanDate,
          user_id: user.id,
          purchase_date: data.showAdditionalInfo ? data.purchaseDate || null : null,
          warranty_length: data.showAdditionalInfo && data.warrantyLength ? parseInt(data.warrantyLength) : null,
          purchase_cost: data.showAdditionalInfo && data.purchaseCost ? parseFloat(data.purchaseCost) : null,
          warranty_file_path: warrantyFilePath,
          receipt_file_path: receiptFilePath
        })
        .select()
        .single()

      if (toolError) {
        console.error('Error creating tool:', toolError)
        toast.error("Failed to create tool")
        return false
      }

      // Handle annotation if it exists
      if (data.annotationData && newTool) {
        const { error: annotationError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: data.annotationData.photo_id,
            tool_id: newTool.id,
            coordinates: data.annotationData.coordinates,
            user_id: user.id
          })

        if (annotationError) {
          console.error('Error creating annotation:', annotationError)
          toast.error("Tool created but failed to save annotation")
          return true // Still return true as the tool was created
        }
      }

      toast.success("Tool created successfully")
      return true
    } catch (error) {
      console.error('Error in handleToolSubmission:', error)
      toast.error("Failed to create tool")
      return false
    } finally {
      setIsUploading(false)
    }
  }

  const uploadFile = async (file: File, type: 'warranty' | 'receipt') => {
    const timestamp = new Date().getTime()
    const fileExt = file.name.split('.').pop()
    const filePath = `${timestamp}_${type}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('warranty-files')
      .upload(filePath, file)

    if (uploadError) {
      console.error(`Error uploading ${type} file:`, uploadError)
      toast.error(`Failed to upload ${type} file`)
      return { success: false, path: null }
    }

    return { success: true, path: filePath }
  }

  return {
    handleToolSubmission,
    isUploading
  }
}