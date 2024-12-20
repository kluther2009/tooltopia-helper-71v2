import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { ToolSearch } from "./tool/ToolSearch"
import { ToolList } from "./tool/ToolList"
import { CreateToolDialog } from "./tool/CreateToolDialog"
import { usePhotoLocation } from "@/hooks/usePhotoLocation"
import { useToolSearch } from "@/hooks/useToolSearch"
import { useIsMobile } from "@/hooks/use-mobile"

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
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { tools, isLoading, searchTools } = useToolSearch()
  const photoLocation = usePhotoLocation(photoId, isOpen)
  const isMobile = useIsMobile()

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

  const handleCreateTool = async (toolId: string) => {
    await handleToolSelect(toolId)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          className={`
            ${isMobile ? 'fixed bottom-0 left-0 right-0 top-auto rounded-b-none' : 'fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 rounded-lg'}
            sm:max-w-[425px] max-h-[60vh] sm:max-h-[90vh] overflow-hidden bg-white
          `}
          style={{
            ...(isMobile && {
              bottom: '0',
              maxHeight: '60vh',
              transform: 'none'
            })
          }}
        >
          <DialogHeader>
            <DialogTitle>Select Tool</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto p-4 pb-safe">
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