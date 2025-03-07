
import { ScrollArea } from "@/components/ui/scroll-area"
import { LocationPhoto } from "@/types/photos"
import { PhotoCard } from "./PhotoCard"
import { useIsMobile } from "@/hooks/use-mobile"

interface PhotoGridProps {
  photos: LocationPhoto[]
  onPhotoClick: (photo: LocationPhoto) => void
  onDeleteClick?: (photo: LocationPhoto) => void
  disabled?: boolean
}

export function PhotoGrid({ photos, onPhotoClick, onDeleteClick, disabled }: PhotoGridProps) {
  const isMobile = useIsMobile()
  
  return (
    <ScrollArea className={isMobile ? "h-[300px]" : "h-[500px]"}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onPhotoClick={onPhotoClick}
            onDeleteClick={onDeleteClick}
            disabled={disabled}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
