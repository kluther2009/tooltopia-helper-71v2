import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (message: string) => {
    setIsLoading(true)
    try {
      // First get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Auth error:', userError)
        toast.error("You must be logged in to use ToolGuru")
        return null
      }

      console.log('Sending message to Claude:', { 
        message, 
        userId: user.id 
      })
      
      const { data, error } = await supabase.functions.invoke('chat-with-claude', {
        body: { 
          message,
          userId: user.id
        }
      })

      if (error) {
        console.error('Claude error:', error)
        throw error
      }

      console.log('Received response from Claude:', data)

      if (!data?.content?.[0]?.text) {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response format from AI')
      }

      return data.content[0].text
    } catch (error) {
      console.error('Error calling Claude:', error)
      toast.error("Failed to get AI response, please try again")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { sendMessage, isLoading }
}