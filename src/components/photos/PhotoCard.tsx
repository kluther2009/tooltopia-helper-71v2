
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Wrench } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LocationPhoto } from "@/types/photos"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface PhotoCardProps {
  photo: LocationPhoto
  onPhotoClick: (photo: LocationPhoto) => void
  onDeleteClick?: (photo: LocationPhoto) => void
  disabled?: boolean
  onToolIconClick?: (event: React.MouseEvent, toolId: string) => void
}

export function PhotoCard({ 
  photo, 
  onPhotoClick, 
  onDeleteClick,
  disabled,
  onToolIconClick
}: PhotoCardProps) {
  const isMobile = useIsMobile()
  const [imageUrl, setImageUrl] = useState<string>("")
  const [hasAnnotation, setHasAnnotation] = useState<boolean>(false)
  const [toolId, setToolId] = useState<string | null>(null)
  
  // Fetch the image URL and check for annotations when component mounts
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        // Get the image URL
        const { data } = supabase.storage
          .from('location-photos')
          .getPublicUrl(photo.file_path)
          
        setImageUrl(data.publicUrl)
        
        // Check if this photo has a tool annotation
        const { data: annotations, error } = await supabase
          .from('tool_annotations')
          .select('id, tool_id')
          .eq('photo_id', photo.id)
          .limit(1)
          
        if (!error && annotations.length > 0) {
          setHasAnnotation(true)
          setToolId(annotations[0].tool_id)
        }
      } catch (error) {
        console.error('Error loading photo:', error)
      }
    }
    
    fetchImageUrl()
  }, [photo.id, photo.file_path])
  
  const handleCardClick = () => {
    if (!disabled) {
      onPhotoClick(photo)
    }
  }
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteClick?.(photo)
  }
  
  const handleToolClick = (e: React.MouseEvent) => {
    if (toolId && onToolIconClick) {
      onToolIconClick(e, toolId)
    }
  }
  
  return (
    <TooltipProvider>
      <Card 
        className={`overflow-hidden transition-all ${disabled ? 'opacity-60' : 'cursor-pointer hover:ring-2 hover:ring-primary hover:shadow-md'}`}
        onClick={handleCardClick}
      >
        <div className="relative">
          <img 
            src={imageUrl || "/placeholder.svg"} 
            alt={`Photo from ${photo.location}`}
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
          
          <div className="absolute top-2 right-2 flex gap-1">
            {hasAnnotation && toolId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 bg-black/50 hover:bg-black/70"
                    onClick={handleToolClick}
                  >
                    <Wrench className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Tool Details</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {onDeleteClick && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white hover:text-destructive"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Photo</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        
        <CardContent className={isMobile ? "p-2" : "p-3"}>
          <div className={`font-medium ${isMobile ? "text-xs" : "text-sm"} truncate`}>
            {photo.location}
          </div>
          {photo.sub_location && (
            <div className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"} truncate`}>
              {photo.sub_location}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
