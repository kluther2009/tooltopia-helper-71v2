import { Card } from "@/components/ui/card"
import { LocationPhoto } from "@/types/photos"
import { PhotoCard } from "./PhotoCard"

interface PhotoLocationGroupProps {
  location: string
  photos: LocationPhoto[]
  onPhotoClick: (photo: LocationPhoto) => void
  onDeleteClick: (photo: LocationPhoto) => void
}

export function PhotoLocationGroup({ 
  location, 
  photos, 
  onPhotoClick, 
  onDeleteClick 
}: PhotoLocationGroupProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{location}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onPhotoClick={onPhotoClick}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </div>
    </Card>
  )
}