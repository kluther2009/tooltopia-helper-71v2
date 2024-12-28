import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tool } from "@/hooks/useTools";
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to add tools')
        return
      }

      const { error } = await supabase
        .from('project_tools')
        .insert({
          project_id: projectId,
          tool_id: toolId,
        })

      if (error) throw error
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["project-tools"] })
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      
      toast.success('Tool added to project')
    } catch (error) {
      console.error('Error adding tool to project:', error)
      toast.error('Failed to add tool to project')
    }
  }

  const handleCreateTool = async (toolId: string) => {
    await handleToolSelect(toolId)
    setShowCreateDialog(false)
  }

  const handleCancel = () => {
    // Invalidate both projects and project-tools queries
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    queryClient.invalidateQueries({ queryKey: ["project-tools", projectId] })
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Tool</DialogTitle>
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