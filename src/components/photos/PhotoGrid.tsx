
import { ScrollArea } from "@/components/ui/scroll-area"
import { LocationPhoto } from "@/types/photos"
import { PhotoCard } from "./PhotoCard"
import { useIsMobile } from "@/hooks/use-mobile"
import { ToolDetailDialog } from "@/components/tool/ToolDetailDialog"
import { useState } from "react"

interface PhotoGridProps {
  photos: LocationPhoto[]
  onPhotoClick: (photo: LocationPhoto) => void
  onDeleteClick?: (photo: LocationPhoto) => void
  disabled?: boolean
}

export function PhotoGrid({ photos, onPhotoClick, onDeleteClick, disabled }: PhotoGridProps) {
  const isMobile = useIsMobile()
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  
  const handleToolIconClick = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation() // Prevent the photo card click event
    setSelectedToolId(toolId)
    setIsDetailDialogOpen(true)
  }
  
  return (
    <>
      <ScrollArea className={isMobile ? "h-[300px]" : "h-[500px]"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onPhotoClick={onPhotoClick}
              onDeleteClick={onDeleteClick}
              disabled={disabled}
              onToolIconClick={handleToolIconClick}
            />
          ))}
        </div>
      </ScrollArea>
      
      <ToolDetailDialog 
        toolId={selectedToolId}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </>
  )
}
