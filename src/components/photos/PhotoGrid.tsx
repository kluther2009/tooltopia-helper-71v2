
import { ScrollArea } from "@/components/ui/scroll-area"
import { LocationPhoto } from "@/types/photos"
import { PhotoCard } from "./PhotoCard"

interface PhotoGridProps {
  photos: LocationPhoto[]
  onPhotoClick: (photo: LocationPhoto) => void
  onDeleteClick?: (photo: LocationPhoto) => void
  disabled?: boolean
}

export function PhotoGrid({ photos, onPhotoClick, onDeleteClick, disabled }: PhotoGridProps) {
  return (
    <ScrollArea className="h-[500px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
