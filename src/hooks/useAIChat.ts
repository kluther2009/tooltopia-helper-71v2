import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const sendMessage = async (message: string) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to use ToolGuru",
          variant: "destructive"
        })
        return null
      }

      const { data, error } = await supabase.functions.invoke('chat-with-claude', {
        body: { 
          message,
          userId: user.id
        },
      })

      if (error) throw error

      return data.content[0].text
    } catch (error) {
      console.error('Error calling Claude:', error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { sendMessage, isLoading }
}