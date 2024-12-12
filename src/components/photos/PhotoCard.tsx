import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/integrations/supabase/client"
import { LocationPhoto } from "@/types/photos"
import { Trash2 } from "lucide-react"

interface PhotoCardProps {
  photo: LocationPhoto
  onPhotoClick: (photo: LocationPhoto) => void
  onDeleteClick: (photo: LocationPhoto) => void
}

export function PhotoCard({ photo, onPhotoClick, onDeleteClick }: PhotoCardProps) {
  return (
    <Card key={photo.id} className="p-4">
      <div className="aspect-video relative rounded-md overflow-hidden mb-3">
        <img
          src={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
          alt={photo.location}
          className="object-cover w-full h-full"
          onClick={() => onPhotoClick(photo)}
        />
      </div>
      <div className="flex justify-between items-center">
        <div>
          <Label>{photo.location}</Label>
          <p className="text-sm text-gray-500">
            {new Date(photo.created_at).toLocaleDateString()}
          </p>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDeleteClick(photo)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}