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
      console.log('Annotation data for tool creation:', annotationData)

      // Create the tool first
      console.log('Creating tool with data:', {
        name: toolName,
        location: primaryLocation,
        sub_location_a: subLocation,
        status
      })

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

      console.log('Tool created successfully:', newTool)

      // Handle file uploads if additional info is provided
      if (showAdditionalInfo) {
        let warrantyPath = null
        let receiptPath = null

        if (warrantyFile) {
          warrantyPath = await uploadFile(warrantyFile, newTool.id, 'warranty')
        }

        if (receiptFile) {
          receiptPath = await uploadFile(receiptFile, newTool.id, 'receipt')
        }

        // Update tool with file paths if any files were uploaded
        if (warrantyPath || receiptPath) {
          const { error: updateError } = await supabase
            .from('tools')
            .update({
              warranty_file_path: warrantyPath,
              receipt_file_path: receiptPath
            })
            .eq('id', newTool.id)

          if (updateError) {
            console.error('Error updating tool with file paths:', updateError)
            toast.error('Failed to save file information')
          }
        }
      }

      // Create annotation if data exists
      if (annotationData) {
        try {
          console.log('Creating annotation with data:', {
            photoId: annotationData.photoId,
            toolId: newTool.id,
            coordinates: annotationData.coordinates,
            userId: user.id
          })

          const { error: annotationError } = await supabase
            .from('tool_annotations')
            .insert({
              photo_id: annotationData.photoId,
              tool_id: newTool.id,
              coordinates: annotationData.coordinates,
              user_id: user.id
            })

          if (annotationError) {
            console.error('Error creating annotation:', annotationError)
            toast.error('Failed to create tool annotation')
            return true
          }
          
          console.log('Annotation created successfully')
          localStorage.removeItem('pendingAnnotation')
        } catch (error) {
          console.error('Error processing annotation data:', error)
        }
      } else {
        console.log('No annotation data provided')
      }

      toast.success(`${toolName} has been added`)
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
    isUploading
  }
}