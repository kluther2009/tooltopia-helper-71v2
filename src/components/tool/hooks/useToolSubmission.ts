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
    receiptFile
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
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to add a tool")
        return false
      }

      // Get and validate annotation data first
      const annotationData = localStorage.getItem('pendingAnnotation')
      let parsedAnnotation = null
      if (annotationData) {
        try {
          parsedAnnotation = JSON.parse(annotationData)
          console.log('Found annotation data:', parsedAnnotation)
          
          // Validate required fields
          if (!parsedAnnotation.photoId || !parsedAnnotation.coordinates) {
            console.error('Invalid annotation data:', parsedAnnotation)
            toast.error('Invalid annotation data')
            return false
          }
        } catch (error) {
          console.error('Error parsing annotation data:', error)
          toast.error('Error parsing annotation data')
          return false
        }
      }

      // Create the tool
      console.log('Creating tool...')
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
      if (parsedAnnotation) {
        console.log('Creating annotation...')
        const { error: annotationError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: parsedAnnotation.photoId,
            tool_id: newTool.id,
            coordinates: parsedAnnotation.coordinates,
            user_id: user.id
          })

        if (annotationError) {
          console.error('Error creating annotation:', annotationError)
          toast.error('Failed to create tool annotation')
          // Even if annotation fails, we don't return false as the tool was created successfully
        } else {
          console.log('Annotation created successfully')
          localStorage.removeItem('pendingAnnotation')
        }
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