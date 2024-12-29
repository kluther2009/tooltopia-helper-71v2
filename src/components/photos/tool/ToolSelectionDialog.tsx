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
      console.log('=== Starting annotation save process ===')
      console.log('Tool selected:', toolId)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No authenticated user found')
        toast.error('You must be logged in to create annotations')
        return
      }

      console.log('Current user:', user.id)

      // Get the stored annotation data
      const storedData = localStorage.getItem('pendingAnnotation')
      console.log('Retrieved stored annotation data:', storedData)

      if (!storedData) {
        console.error('No stored annotation data found')
        toast.error('No annotation data found')
        return
      }

      const parsedData = JSON.parse(storedData)
      console.log('Parsed annotation data:', parsedData)

      if (!parsedData.coordinates) {
        console.error('No coordinates found in stored data')
        toast.error('No annotation coordinates found')
        return
      }

      // Create the annotation
      console.log('Creating annotation with data:', {
        photo_id: photoId,
        tool_id: toolId,
        coordinates: parsedData.coordinates,
        user_id: user.id
      })

      const { data, error } = await supabase
        .from('tool_annotations')
        .insert({
          photo_id: photoId,
          tool_id: toolId,
          coordinates: parsedData.coordinates,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating annotation:', error)
        toast.error(`Failed to save annotation: ${error.message}`)
        return
      }

      console.log('Successfully created annotation:', data)
      
      // Clear the coordinates from stored data
      const updatedData = { ...parsedData }
      delete updatedData.coordinates
      localStorage.setItem('pendingAnnotation', JSON.stringify(updatedData))
      console.log('Updated localStorage data:', updatedData)

      toast.success('Tool annotation saved')
      onToolSelect(toolId)
      onClose()
    } catch (error) {
      console.error('Error in handleToolSelect:', error)
      toast.error('Failed to save tool annotation')
    }
  }

  const handleCreateTool = async (toolId: string) => {
    console.log('Tool created, proceeding to create annotation with toolId:', toolId)
    await handleToolSelect(toolId)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Tool</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
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