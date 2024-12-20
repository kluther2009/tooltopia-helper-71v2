import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToolManagement } from "@/hooks/useToolManagement"
import { toast } from "sonner"
import { ToolLocationFields } from "@/components/ToolLocationFields"
import { useIsMobile } from "@/hooks/use-mobile"

interface CreateToolDialogProps {
  isOpen: boolean
  onClose: () => void
  onToolCreated: (toolId: string) => void
  initialLocation?: string
}

interface ToolResult {
  id: string;
  name: string;
  location: string;
  status: string;
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
  const isMobile = useIsMobile()

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

    const result = await addTool({
      name: toolName,
      primaryLocation,
      subLocation,
      specificLocation,
      status: "available"
    })

    if (result && typeof result === 'object' && 'id' in result) {
      const toolResult = result as ToolResult
      onToolCreated(toolResult.id)
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
      <DialogContent 
        className={`
          ${isMobile ? 'fixed bottom-0 left-0 right-0 top-auto rounded-b-none' : 'fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 rounded-lg'}
          sm:max-w-[425px] max-h-[70vh] sm:max-h-[90vh] overflow-y-auto bg-white
        `}
        style={{
          ...(isMobile && {
            bottom: '0',
            maxHeight: '70vh',
            transform: 'none'
          })
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Tool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-safe">
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

          <DialogFooter className="sm:justify-end pt-4">
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