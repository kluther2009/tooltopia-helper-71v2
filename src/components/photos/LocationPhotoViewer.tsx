import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LocationPhoto } from "@/types/photos";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { PhotoViewerDialog } from "./PhotoViewerDialog";

interface LocationPhotoViewerProps {
  location: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LocationPhotoViewer({ location, isOpen, onClose }: LocationPhotoViewerProps) {
  const [photos, setPhotos] = useState<LocationPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<LocationPhoto | null>(null);

  useEffect(() => {
    if (location && isOpen) {
      fetchPhotos();
    }
  }, [location, isOpen]);

  const fetchPhotos = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('location_photos')
        .select('*')
        .ilike('location', `${location}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[80vh] p-0">
          <div className="p-6 pb-2">
            <h2 className="text-2xl font-semibold">Photos for {location}</h2>
            {photos.length === 0 && !loading && (
              <p className="text-muted-foreground mt-2">No photos found for this location</p>
            )}
          </div>
          <ScrollArea className="h-[calc(80vh-100px)] px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-video relative rounded-md overflow-hidden animate-fade-in cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
                    alt={photo.location}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <PhotoViewerDialog
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
      />
    </>
  );
}