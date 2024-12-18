import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export const useToolManagement = () => {
  const checkToolExists = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('name')
        .ilike('name', name.trim())

      if (error) {
        console.error('Error checking tool name:', error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.error('Error in checkToolExists:', error)
      return false
    }
  }

  const addTool = async (toolData: {
    name: string
    primaryLocation: string
    subLocation: string
    specificLocation: string
    status: string
  }) => {
    const { name, primaryLocation, subLocation, specificLocation, status } = toolData
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a tool.",
        variant: "destructive"
      })
      return false
    }

    const fullLocation = `${primaryLocation}${subLocation ? ` > ${subLocation}` : ''}${specificLocation ? ` > ${specificLocation}` : ''}`

    const { error } = await supabase
      .from('tools')
      .insert([
        {
          name: name.trim(),
          location: fullLocation,
          status,
          user_id: user.id
        }
      ])

    if (error) {
      console.error('Error inserting tool:', error)
      return false
    }

    return true
  }

  return {
    checkToolExists,
    addTool
  }
}