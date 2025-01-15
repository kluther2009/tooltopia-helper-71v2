import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface ConversationEntry {
  message: string;
  response: string;
}

type AIModel = 'claude' | 'openai';

export function useProjectHelper(projectId: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude')

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
        conversation,
        model: selectedModel
      })

      const functionName = selectedModel === 'claude' ? 'chat-with-project-helper' : 'chat-with-project-helper-openai'
      
      const { data, error } = await supabase.functions.invoke(functionName, {
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

  return { sendMessage, isLoading, selectedModel, setSelectedModel }
}