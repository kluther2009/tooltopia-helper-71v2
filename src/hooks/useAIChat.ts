import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const sendMessage = async (message: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-claude', {
        body: { message },
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