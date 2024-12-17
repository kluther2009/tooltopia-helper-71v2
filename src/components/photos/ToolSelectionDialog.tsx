import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { ToolSearch } from "./tool/ToolSearch"
import { ToolList } from "./tool/ToolList"
import { CreateToolDialog } from "./tool/CreateToolDialog"

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
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [photoLocation, setPhotoLocation] = useState("")

  const fetchPhotoLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('location_photos')
        .select('location, sub_location')
        .eq('id', photoId)
        .single()

      if (error) throw error
      
      // Combine location and sub_location if both exist
      const fullLocation = data.sub_location 
        ? `${data.location} > ${data.sub_location}`
        : data.location

      setPhotoLocation(fullLocation)
    } catch (error) {
      console.error('Error fetching photo location:', error)
      toast.error('Failed to fetch photo location')
    }
  }

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

  const handleCreateTool = async (toolId: string) => {
    await handleToolSelect(toolId)
  }

  // Fetch photo location when dialog opens
  useState(() => {
    if (isOpen) {
      fetchPhotoLocation()
    }
  }, [isOpen, photoId])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Tool</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ToolSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
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