
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocationPhoto } from "@/types/photos"
import { PhotoAnnotationOverlay } from "./PhotoAnnotationOverlay"

interface LocationPhotoViewerProps {
  isOpen: boolean
  onClose: () => void
  photo: LocationPhoto
  onNavigate?: (direction: 'prev' | 'next') => void
  showNavigation?: boolean
}

export function LocationPhotoViewer({
  isOpen,
  onClose,
  photo,
  onNavigate,
  showNavigation = false
}: LocationPhotoViewerProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!photo?.file_path || !isOpen) return

    setIsLoading(true)
    setError(null)

    const fetchPhotoUrl = async () => {
      try {
        const { data } = supabase.storage
          .from('location-photos')
          .getPublicUrl(photo.file_path)

        if (data?.publicUrl) {
          console.log('Public URL obtained:', data.publicUrl)
          setPhotoUrl(data.publicUrl)
        } else {
          setError('Failed to get photo URL')
        }
      } catch (error) {
        console.error('Error getting photo URL:', error)
        setError('Failed to load photo')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhotoUrl()
  }, [photo, isOpen])

  const handleImageLoad = () => {
    setIsLoading(false)
    if (imageRef.current) {
      setImageWidth(imageRef.current.naturalWidth)
      setImageHeight(imageRef.current.naturalHeight)
    }
  }

  const handleImageError = () => {
    setIsLoading(false)
    setError('Failed to load image')
    toast.error('Failed to load image')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 overflow-hidden">
        <div className="relative flex justify-center items-center h-full w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {photoUrl && (
            <div className="relative max-h-[85vh] max-w-full overflow-auto">
              <img
                ref={imageRef}
                src={photoUrl}
                alt="Location"
                className="max-h-[85vh] max-w-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {!isLoading && !error && (
                <PhotoAnnotationOverlay
                  photoId={photo.id}
                  imageWidth={imageWidth}
                  imageHeight={imageHeight}
                />
              )}
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            </div>
          )}
          
          {error && (
            <div className="text-center text-red-500 p-4">
              {error}
            </div>
          )}
          
          {showNavigation && onNavigate && (
            <>
              <Button 
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                onClick={() => onNavigate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                onClick={() => onNavigate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
