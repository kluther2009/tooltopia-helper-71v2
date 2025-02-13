
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface PhotoReplacementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhotoReplacementDialog({ open, onOpenChange }: PhotoReplacementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6">
          <h2 className="text-2xl font-semibold">Replace Photo</h2>
        </div>
      </DialogContent>
    </Dialog>
  )
}
