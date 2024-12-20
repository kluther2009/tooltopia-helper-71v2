import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToolManagement } from "@/hooks/useToolManagement"
import { toast } from "sonner"
import { ToolLocationFields } from "@/components/ToolLocationFields"

interface CreateToolDialogProps {
  isOpen: boolean
  onClose: () => void
  onToolCreated: (toolId: string) => void
  initialLocation?: string
}

export function CreateToolDialog({
  isOpen,
  onClose,
  onToolCreated,
  initialLocation = ""
}: CreateToolDialogProps) {
  const [toolName, setToolName] = useState("")
  const [primaryLocation, setPrimaryLocation] = useState(initialLocation)
  const [subLocation, setSubLocation] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const { checkToolExists, addTool } = useToolManagement()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!toolName.trim()) {
      toast.error("Tool name is required")
      return
    }

    const toolExists = await checkToolExists(toolName)
    if (toolExists) {
      toast.error("This tool already exists")
      return
    }

    const success = await addTool({
      name: toolName,
      primaryLocation,
      subLocation,
      specificLocation,
      status: "available"
    })

    if (success?.id) {
      onToolCreated(success.id)
      handleClose()
    }
  }

  const handleClose = () => {
    setToolName("")
    setPrimaryLocation(initialLocation)
    setSubLocation("")
    setSpecificLocation("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] fixed bottom-0 left-0 right-0 top-auto sm:bottom-auto sm:left-[50%] sm:right-auto sm:top-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2 rounded-b-none sm:rounded-lg max-h-[70vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Tool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="toolName">Tool Name</Label>
            <Input
              id="toolName"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="Enter tool name"
            />
          </div>

          <ToolLocationFields
            primaryLocation={primaryLocation}
            subLocation={subLocation}
            specificLocation={specificLocation}
            onPrimaryLocationChange={setPrimaryLocation}
            onSubLocationChange={setSubLocation}
            onSpecificLocationChange={setSpecificLocation}
          />

          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Tool
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}