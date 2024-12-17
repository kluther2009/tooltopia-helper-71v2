import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface Tool {
  id: string
  name: string
}

export function useToolSearch() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const searchTools = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('id, name')
        .ilike('name', `%${searchQuery}%`)
        .limit(10)

      if (error) throw error
      setTools(data)
    } catch (error) {
      console.error('Error searching tools:', error)
      toast.error('Failed to search tools')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    tools,
    isLoading,
    searchTools,
  }
}