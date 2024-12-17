import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Check, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface ToolSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onToolSelect: (toolId: string) => void
  coordinates: { x: number; y: number; width: number; height: number }
  photoId: string
}

export function ToolSelectionDialog({
  isOpen,
  onClose,
  onToolSelect,
  coordinates,
  photoId
}: ToolSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [tools, setTools] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
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

  const handleToolSelect = async (toolId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to create annotations')
        return
      }

      const { error } = await supabase
        .from('tool_annotations')
        .insert({
          photo_id: photoId,
          tool_id: toolId,
          coordinates,
          user_id: user.id
        })

      if (error) throw error
      
      toast.success('Tool annotation saved')
      onToolSelect(toolId)
      onClose()
    } catch (error) {
      console.error('Error saving tool annotation:', error)
      toast.error('Failed to save tool annotation')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Tool</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => handleToolSelect(tool.id)}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}