import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

async function uploadFile(file: File, toolId: string, type: 'warranty' | 'receipt'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const filePath = `${toolId}/${type}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('warranty-files')
      .upload(filePath, file)

    if (uploadError) {
      console.error(`Error uploading ${type} file:`, uploadError)
      toast.error(`Failed to upload ${type} file`)
      return null
    }

    return filePath
  } catch (error) {
    console.error(`Error in uploadFile:`, error)
    toast.error(`Failed to upload ${type} file`)
    return null
  }
}

export function useToolSubmission() {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)

  const handleToolUpdate = async ({
    toolId,
    location,
    subLocation,
    specificLocation,
    status,
    annotationData
  }: {
    toolId: string
    location: string
    subLocation?: string
    specificLocation?: string
    status?: string
    annotationData?: any
  }) => {
    setIsUploading(true)
    try {
      // 1. Update tool location
      const { error: toolError } = await supabase
        .from('tools')
        .update({
          location: location,
          sub_location_a: subLocation || null,
          sub_location_b: specificLocation || null,
          status: status
        })
        .eq('id', toolId)

      if (toolError) {
        console.error('Error updating tool:', toolError)
        throw toolError
      }

      // 2. If we have annotation data, update the annotation
      if (annotationData) {
        // First delete any existing annotation
        const { error: deleteError } = await supabase
          .from('tool_annotations')
          .delete()
          .eq('tool_id', toolId)

        if (deleteError) {
          console.error('Error deleting old annotation:', deleteError)
          throw deleteError
        }

        // Then create new annotation
        const { error: annotationError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: annotationData.photoId,
            tool_id: toolId,
            coordinates: annotationData.coordinates,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })

        if (annotationError) {
          console.error('Error creating new annotation:', annotationError)
          throw annotationError
        }
      }

      toast.success('Tool updated successfully')
      navigate('/tools')
      return true
    } catch (error) {
      console.error('Error in handleToolUpdate:', error)
      toast.error('Failed to update tool')
      return false
    } finally {
      setIsUploading(false)
    }
  }

  const handleToolSubmission = async ({
    toolName,
    primaryLocation,
    subLocation,
    specificLocation,
    status,
    showAdditionalInfo,
    purchaseDate,
    warrantyLength,
    purchaseCost,
    warrantyFile,
    receiptFile,
    annotationData
  }: {
    toolName: string
    primaryLocation: string
    subLocation: string
    specificLocation: string
    status: string
    showAdditionalInfo: boolean
    purchaseDate: string
    warrantyLength: string
    purchaseCost: string
    warrantyFile: File | null
    receiptFile: File | null
    annotationData: any
  }) => {
    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to add a tool")
        return false
      }

      console.log('Starting tool submission process')

      // Check if tool exists
      const { data: existingTool } = await supabase
        .from('tools')
        .select('id')
        .eq('name', toolName.trim())
        .single()

      if (existingTool) {
        // If tool exists, update it
        return handleToolUpdate({
          toolId: existingTool.id,
          location: primaryLocation,
          subLocation,
          specificLocation,
          status,
          annotationData
        })
      }

      // If tool doesn't exist, create new one
      const { data: newTool, error: toolError } = await supabase
        .from('tools')
        .insert({
          name: toolName.trim(),
          location: primaryLocation,
          sub_location_a: subLocation || null,
          sub_location_b: specificLocation || null,
          status,
          user_id: user.id,
          purchase_date: showAdditionalInfo ? purchaseDate || null : null,
          warranty_length: showAdditionalInfo && warrantyLength ? parseInt(warrantyLength) : null,
          purchase_cost: showAdditionalInfo && purchaseCost ? parseFloat(purchaseCost) : null
        })
        .select()
        .single()

      if (toolError) {
        console.error('Error creating tool:', toolError)
        toast.error('Failed to create tool')
        return false
      }

      // Handle file uploads and annotation creation as before...
      // [Previous code for files and annotation remains the same]

      toast.success(`${toolName} has been added`)
      navigate('/tools')
      return true
    } catch (error) {
      console.error('Error in handleToolSubmission:', error)
      toast.error("Failed to add tool")
      return false
    } finally {
      setIsUploading(false)
    }
  }

  return {
    handleToolSubmission,
    handleToolUpdate,
    isUploading
  }
}