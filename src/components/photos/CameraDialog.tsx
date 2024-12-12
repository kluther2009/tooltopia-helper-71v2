import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRef, useEffect } from "react"
import { toast } from "sonner"

interface CameraDialogProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (file: File) => void
}

export function CameraDialog({ isOpen, onClose, onCapture }: CameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      toast.error('Unable to access camera')
      console.error('Camera error:', error)
      onClose()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const handleCapture = async () => {
    if (!videoRef.current || !streamRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0)
    
    canvas.toBlob(async (blob) => {
      if (!blob) return
      
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
      onCapture(file)
      onClose()
    }, 'image/jpeg')
  }

  useEffect(() => {
    if (isOpen) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Take Photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <Button onClick={handleCapture} className="w-full">
            Capture Photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}