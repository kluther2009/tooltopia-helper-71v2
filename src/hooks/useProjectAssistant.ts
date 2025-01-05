import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export function useProjectAssistant(projectId: string) {
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (message: string) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in to use Project Helper")
        return null
      }

      console.log('Sending message to Project Assistant:', { message, userId: user.id, projectId })

      const { data, error } = await supabase.functions.invoke('chat-with-project-assistant', {
        body: { 
          message,
          userId: user.id,
          projectId
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (error) {
        console.error('Project Assistant error:', error)
        throw error
      }

      console.log('Received response from Project Assistant:', data)

      if (!data?.content) {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response format from AI')
      }

      return data.content
    } catch (error) {
      console.error('Error calling Project Assistant:', error)
      toast.error("Failed to get AI response, please try again")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { sendMessage, isLoading }
}