import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { ToolSearch } from "./tool/ToolSearch"
import { ToolList } from "./tool/ToolList"
import { CreateToolDialog } from "./tool/CreateToolDialog"
import { usePhotoLocation } from "@/hooks/usePhotoLocation"
import { useToolSearch } from "@/hooks/useToolSearch"

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

  const handleToolSelect = async (toolId: string) => {
    try {
      console.log('Starting annotation save process with data:', {
        photoId,
        toolId,
        coordinates
      });

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No authenticated user found');
        toast.error('You must be logged in to create annotations')
        return
      }

      // First, check if this tool already has an annotation
      const { data: existingAnnotation } = await supabase
        .from('tool_annotations')
        .select('id')
        .eq('tool_id', toolId)
        .maybeSingle()

      // Format coordinates for consistency
      const formattedCoordinates = {
        x: Number(coordinates.x),
        y: Number(coordinates.y),
        width: Number(coordinates.width),
        height: Number(coordinates.height)
      };

      if (existingAnnotation) {
        // Update existing annotation with new coordinates
        const { error: updateError } = await supabase
          .from('tool_annotations')
          .update({
            coordinates: formattedCoordinates,
            photo_id: photoId
          })
          .eq('id', existingAnnotation.id)

        if (updateError) {
          console.error('Error updating annotation:', updateError);
          toast.error('Failed to update tool location');
          return;
        }

        toast.success('Tool location updated');
      } else {
        // Create new annotation
        const { error: insertError } = await supabase
          .from('tool_annotations')
          .insert({
            photo_id: photoId,
            tool_id: toolId,
            coordinates: formattedCoordinates,
            user_id: user.id
          })

        if (insertError) {
          console.error('Error creating annotation:', insertError);
          toast.error('Failed to create tool annotation');
          return;
        }

        toast.success('Tool annotation saved');
      }

      // Clear the pending annotation data
      localStorage.removeItem('pendingAnnotation');
      
      onToolSelect(toolId);
      onClose();
    } catch (error) {
      console.error('Error in handleToolSelect:', error);
      toast.error('Failed to save tool annotation');
    }
  }

  const handleCreateTool = async (toolId: string) => {
    console.log('Tool created, proceeding to create annotation with toolId:', toolId);
    await handleToolSelect(toolId);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="tool-selection-description">
          <DialogHeader>
            <DialogTitle>Select Tool</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p id="tool-selection-description" className="text-sm text-gray-500">
              Select an existing tool or create a new one to annotate this location.
            </p>
            
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