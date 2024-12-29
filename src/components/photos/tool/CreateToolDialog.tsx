import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface CreateToolDialogProps {
  isOpen: boolean
  onClose: () => void
  onToolCreated: (toolId: string) => void
  initialLocation: string
}

interface LocationInfo {
  location: string
  subLocation?: string | null
}

export function CreateToolDialog({ isOpen, onClose, onToolCreated, initialLocation }: CreateToolDialogProps) {
  const [name, setName] = useState("")
  const [status, setStatus] = useState("available")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Please enter a tool name")
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Starting tool creation process...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Get location information from localStorage if it exists
      const annotationData = localStorage.getItem('pendingAnnotation')
      let locationInfo: LocationInfo = { location: initialLocation }
      
      if (annotationData) {
        console.log('Found pending annotation data:', annotationData)
        const data = JSON.parse(annotationData)
        locationInfo = {
          location: data.location || initialLocation,
          subLocation: data.subLocation || null
        }
      }

      console.log('Creating tool with location:', locationInfo)

      // Create the tool with location information
      const { data, error } = await supabase
        .from('tools')
        .insert({
          name: name.trim(),
          location: locationInfo.location,
          sub_location_a: locationInfo.subLocation,
          status,
          user_id: user.id
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating tool:', error)
        throw error
      }

      console.log('Tool created successfully:', data)
      
      // If we have annotation data, make sure we keep it for the next step
      if (annotationData) {
        const parsedData = JSON.parse(annotationData)
        if (parsedData.coordinates && parsedData.photoId) {
          console.log('Preserving annotation data for tool annotation creation')
          localStorage.setItem('pendingAnnotation', JSON.stringify({
            ...parsedData,
            toolId: data.id
          }))
        }
      }

      toast.success("Tool created successfully")
      onToolCreated(data.id)
      onClose()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast.error("Failed to create tool")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Tool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tool Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tool name"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={initialLocation}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Tool"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
