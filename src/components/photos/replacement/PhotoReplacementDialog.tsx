
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import { LocationPhoto } from "@/types/photos"
import { PhotoSelector } from "./PhotoSelector"
import { DualCanvasView } from "./DualCanvasView"

interface PhotoReplacementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhotoReplacementDialog({ open, onOpenChange }: PhotoReplacementDialogProps) {
  const [oldPhoto, setOldPhoto] = useState<LocationPhoto | null>(null)
  const [newPhoto, setNewPhoto] = useState<LocationPhoto | null>(null)
  const [step, setStep] = useState<'select-old' | 'select-new' | 'transfer'>('select-old')

  const handleOldPhotoSelect = (photo: LocationPhoto) => {
    setOldPhoto(photo)
    setStep('select-new')
  }

  const handleNewPhotoSelect = (photo: LocationPhoto) => {
    setNewPhoto(photo)
    setStep('transfer')
  }

  const handleClose = () => {
    setOldPhoto(null)
    setNewPhoto(null)
    setStep('select-old')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
        {step === 'select-old' && (
          <PhotoSelector
            title="Select Old Photo"
            onPhotoSelect={handleOldPhotoSelect}
          />
        )}
        
        {step === 'select-new' && (
          <PhotoSelector
            title="Select New Photo"
            onPhotoSelect={handleNewPhotoSelect}
            excludePhotoId={oldPhoto?.id}
          />
        )}
        
        {step === 'transfer' && oldPhoto && newPhoto && (
          <DualCanvasView
            oldPhoto={oldPhoto}
            newPhoto={newPhoto}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
