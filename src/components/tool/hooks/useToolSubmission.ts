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
      console.log('Checking for annotation data...')
      const annotationData = localStorage.getItem('pendingAnnotation')
      console.log('Raw annotation data from localStorage:', annotationData)
      
      // Store the annotation data in session storage before we start creating the tool
      // This ensures it persists through the navigation
      if (annotationData) {
        sessionStorage.setItem('tempAnnotationData', annotationData)
        console.log('Stored annotation data in session storage')
      }

      let parsedAnnotation = null
      
      if (annotationData) {
        try {
          parsedAnnotation = JSON.parse(annotationData)
          console.log('Successfully parsed annotation data:', parsedAnnotation)
          
          // Validate required fields
          if (!parsedAnnotation.photoId || !parsedAnnotation.coordinates) {
            console.error('Invalid annotation data - missing required fields:', parsedAnnotation)
            toast.error('Invalid annotation data')
            return false
          }

          console.log('Annotation data validation passed')
        } catch (error) {
          console.error('Error parsing annotation data:', error)
          toast.error('Error parsing annotation data')
          return false
        }
      }

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
      // Retrieve from session storage instead of local storage
      const tempAnnotationData = sessionStorage.getItem('tempAnnotationData')
      console.log('Retrieved annotation data from session storage:', tempAnnotationData)

      if (tempAnnotationData) {
        try {
          const annotationInfo = JSON.parse(tempAnnotationData)
          console.log('Processing annotation data for creation:', annotationInfo)

          const { error: annotationError } = await supabase
            .from('tool_annotations')
            .insert({
              photo_id: annotationInfo.photoId,
              tool_id: newTool.id,
              coordinates: annotationInfo.coordinates,
              user_id: user.id
            })

          if (annotationError) {
            console.error('Error creating annotation:', annotationError)
            toast.error('Failed to create tool annotation')
            // Keep the data in storage for retry
            return true
          } else {
            console.log('Annotation created successfully')
            // Only remove data after successful creation
            localStorage.removeItem('pendingAnnotation')
            sessionStorage.removeItem('tempAnnotationData')
          }
        } catch (error) {
          console.error('Error processing annotation data:', error)
        }
      } else {
        console.log('No annotation data found in session storage')
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
