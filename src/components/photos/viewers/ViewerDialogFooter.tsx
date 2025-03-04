
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { DialogFooter } from "@/components/ui/dialog"

interface ViewerDialogFooterProps {
  loading: boolean
  error: string | null
  selectedTool: any | null
  isEditing: boolean
  onEditTool: () => void
  onClose: () => void
  onConfirm: () => void
}

export function ViewerDialogFooter({
  loading,
  error,
  selectedTool,
  isEditing,
  onEditTool,
  onClose,
  onConfirm
}: ViewerDialogFooterProps) {
  return (
    <DialogFooter className="p-4 pt-2">
      <div className="flex justify-between w-full">
        <div>
          {selectedTool && !isEditing && (
            <Button variant="outline" onClick={onEditTool}>
              Edit Bounding Box
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} disabled={loading || !!error}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>
    </DialogFooter>
  )
}
