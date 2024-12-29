import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useFileUpload } from "@/hooks/useFileUpload"

export function useToolSubmission() {
  const navigate = useNavigate()
  const { uploadFile, isUploading } = useFileUpload()

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
    annotationData // Add this parameter
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
    annotationData: any // Add this type
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to add a tool")
        return false
      }

      console.log('Starting tool submission process with annotation data:', annotationData)

      // Create the tool
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

      // Handle file uploads
      if (showAdditionalInfo) {
        if (warrantyFile) {
          const warrantyPath = await uploadFile(warrantyFile, newTool.id, 'warranty')
          if (warrantyPath) {
            await supabase
              .from('tools')
              .update({ warranty_file_path: warrantyPath })
              .eq('id', newTool.id)
          }
        }

        if (receiptFile) {
          const receiptPath = await uploadFile(receiptFile, newTool.id, 'receipt')
          if (receiptPath) {
            await supabase
              .from('tools')
              .update({ receipt_file_path: receiptPath })
              .eq('id', newTool.id)
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
          } else {
            console.log('Annotation created successfully')
            localStorage.removeItem('pendingAnnotation')
          }
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
    }
  }

  return {
    handleToolSubmission,
    isUploading
  }
}