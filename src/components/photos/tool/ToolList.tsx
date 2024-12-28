import { Check, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface Tool {
  id: string
  name: string
}

interface ToolListProps {
  tools: Tool[]
  isLoading: boolean
  onToolSelect: (toolId: string) => void
  onAddNewTool: () => void
  projectId?: string
}

export function ToolList({ tools, isLoading, onToolSelect, onAddNewTool, projectId }: ToolListProps) {
  // Fetch existing project tools if projectId is provided
  const { data: selectedTools } = useQuery({
    queryKey: ["project-tools", projectId],
    queryFn: async () => {
      if (!projectId) return []
      const { data, error } = await supabase
        .from("project_tools")
        .select("tool_id")
        .eq("project_id", projectId)
      
      if (error) throw error
      return data.map(pt => pt.tool_id)
    },
    enabled: !!projectId
  })

  const isToolSelected = (toolId: string) => {
    return selectedTools?.includes(toolId)
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onAddNewTool}
        >
          <Plus className="h-4 w-4" />
          Add as new tool
        </Button>
        
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            onClick={() => onToolSelect(tool.id)}
          >
            <span>{tool.name}</span>
            {isToolSelected(tool.id) && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </div>
        ))}
        
        {tools.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-4">
            No tools found
          </div>
        )}
        
        {isLoading && (
          <div className="text-center text-gray-500 py-4">
            Searching...
          </div>
        )}
      </div>
    </ScrollArea>
  )
}