import { Check, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface Tool {
  id: string
  name: string
}

interface ToolListProps {
  tools: Tool[]
  isLoading: boolean
  onToolSelect: (toolId: string) => void
  onAddNewTool: () => void
}

export function ToolList({ tools, isLoading, onToolSelect, onAddNewTool }: ToolListProps) {
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
            <Check className="h-4 w-4 text-green-500" />
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
  );
}