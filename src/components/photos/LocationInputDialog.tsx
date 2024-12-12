import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LocationInputDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (location: string) => void
  locationInput: string
  setLocationInput: (value: string) => void
}

export function LocationInputDialog({
  isOpen,
  onClose,
  onConfirm,
  locationInput,
  setLocationInput
}: LocationInputDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Location Name</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter the location name"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(locationInput)} disabled={!locationInput.trim()}>
            Upload Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}