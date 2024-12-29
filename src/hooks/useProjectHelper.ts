import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export function useProjectHelper(projectId: string) {
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (message: string) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in to use Project Helper")
        return null
      }

      const { data, error } = await supabase.functions.invoke('chat-with-project-helper', {
        body: { 
          message,
          userId: user.id,
          projectId
        },
      })

      if (error) throw error

      if (!data?.content?.[0]?.text) {
        throw new Error('Invalid response format from AI')
      }

      return data.content[0].text
    } catch (error) {
      console.error('Error calling Project Helper:', error)
      toast.error("Failed to get AI response, please try again")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { sendMessage, isLoading }
}