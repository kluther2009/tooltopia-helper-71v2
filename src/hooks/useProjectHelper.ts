import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface ConversationEntry {
  message: string;
  response: string;
}

export function useProjectHelper(projectId: string) {
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (message: string, conversation: ConversationEntry[] = []) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in to use Project Helper")
        return null
      }

      // Fetch project tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
        throw tasksError
      }

      console.log('Sending message to Project Helper:', { 
        message, 
        userId: user.id, 
        projectId,
        tasks,
        conversation 
      })

      const { data, error } = await supabase.functions.invoke('chat-with-project-helper', {
        body: { 
          message,
          userId: user.id,
          projectId,
          tasks,
          conversation
        }
      })

      if (error) {
        console.error('Project Helper error:', error)
        throw error
      }

      console.log('Received response from Project Helper:', data)

      if (!data?.content) {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response format from AI')
      }

      return data.content
    } catch (error: any) {
      console.error('Error calling Project Helper:', error)
      toast.error(error.message || "Failed to get AI response, please try again")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { sendMessage, isLoading }
}