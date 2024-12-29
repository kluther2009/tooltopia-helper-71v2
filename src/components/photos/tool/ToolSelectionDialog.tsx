import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { ToolSearch } from "./ToolSearch"
import { ToolList } from "./ToolList"
import { CreateToolDialog } from "./CreateToolDialog"
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

      // Get stored coordinates from localStorage
      const storedData = localStorage.getItem('pendingAnnotation');
      if (!storedData) {
        console.error('No pending annotation data found');
        toast.error('No annotation coordinates found');
        return;
      }

      const parsedData = JSON.parse(storedData);
      if (!parsedData.coordinates) {
        console.error('No coordinates in pending annotation data');
        toast.error('No annotation coordinates found');
        return;
      }

      console.log('Creating annotation with coordinates:', parsedData.coordinates);

      const { data, error } = await supabase
        .from('tool_annotations')
        .insert({
          photo_id: photoId,
          tool_id: toolId,
          coordinates: parsedData.coordinates,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Failed to save annotation: ${error.message}`);
        throw error;
      }

      console.log('Successfully created annotation:', data);
      
      // Clear the pending annotation data
      localStorage.removeItem('pendingAnnotation');

      toast.success('Tool annotation saved');
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