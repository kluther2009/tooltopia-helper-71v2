import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ToolSearch } from "../photos/tool/ToolSearch";
import { ToolList } from "../photos/tool/ToolList";
import { CreateToolDialog } from "../photos/tool/CreateToolDialog";
import { usePhotoLocation } from "@/hooks/usePhotoLocation";
import { useToolSearch } from "@/hooks/useToolSearch";

interface ProjectToolsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectToolsDialog({ projectId, open, onOpenChange }: ProjectToolsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { tools, isLoading, searchTools } = useToolSearch()
  const photoLocation = usePhotoLocation(projectId, open)
  const queryClient = useQueryClient()

  const handleToolSelect = async (toolId: string) => {
    try {
      const { data: existingTool } = await supabase
        .from('project_tools')
        .select('id')
        .eq('project_id', projectId)
        .eq('tool_id', toolId)
        .single()

      if (existingTool) {
        // If tool exists, remove it
        const { error: deleteError } = await supabase
          .from('project_tools')
          .delete()
          .eq('project_id', projectId)
          .eq('tool_id', toolId)

        if (deleteError) throw deleteError
        toast.success('Tool removed from project')
      } else {
        // If tool doesn't exist, add it
        const { error: insertError } = await supabase
          .from('project_tools')
          .insert({
            project_id: projectId,
            tool_id: toolId,
          })

        if (insertError) throw insertError
        toast.success('Tool added to project')
      }
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["project-tools", projectId] })
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
    } catch (error) {
      console.error('Error managing project tool:', error)
      toast.error('Failed to update project tools')
    }
  }

  const handleCreateTool = async (toolId: string) => {
    await handleToolSelect(toolId)
    setShowCreateDialog(false)
  }

  const handleCancel = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    queryClient.invalidateQueries({ queryKey: ["project-tools", projectId] })
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Tools</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ToolSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={() => searchTools(searchQuery)}
              isLoading={isLoading}
            />
            
            <ToolList
              tools={tools}
              isLoading={isLoading}
              onToolSelect={handleToolSelect}
              onAddNewTool={() => setShowCreateDialog(true)}
              projectId={projectId}
            />
          </div>
        </DialogContent>
      </Dialog>

      <CreateToolDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onToolCreated={handleCreateTool}
        initialLocation={photoLocation}
      />
    </>
  )
}