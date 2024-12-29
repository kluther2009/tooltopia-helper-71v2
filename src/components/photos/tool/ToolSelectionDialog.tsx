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
    console.log('=== Starting Tool Selection Process ===');
    console.log('Input parameters:', { toolId, photoId, coordinates });
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Auth check result:', user ? 'User authenticated' : 'No user found');
      
      if (!user) {
        console.error('Authentication check failed - no user found');
        toast.error('You must be logged in to create annotations')
        return
      }

      // Get stored coordinates from localStorage
      const storedData = localStorage.getItem('pendingAnnotation');
      console.log('Retrieved stored data:', storedData);
      
      if (!storedData) {
        console.error('No stored annotation data found');
        toast.error('No annotation data found');
        return;
      }

      const parsedData = JSON.parse(storedData);
      console.log('Parsed stored data:', parsedData);
      
      if (!parsedData.coordinates) {
        console.error('No coordinates in stored data');
        toast.error('No annotation coordinates found');
        return;
      }

      const annotationData = {
        photo_id: photoId,
        tool_id: toolId,
        coordinates: parsedData.coordinates,
        user_id: user.id
      };
      
      console.log('Attempting to save annotation with data:', annotationData);

      const { data, error } = await supabase
        .from('tool_annotations')
        .insert(annotationData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Failed to save annotation: ${error.message}`);
        throw error;
      }

      console.log('Successfully created annotation:', data);
      
      // Clear the coordinates from stored data
      const updatedData = { ...parsedData };
      delete updatedData.coordinates;
      localStorage.setItem('pendingAnnotation', JSON.stringify(updatedData));
      console.log('Updated localStorage data:', updatedData);

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