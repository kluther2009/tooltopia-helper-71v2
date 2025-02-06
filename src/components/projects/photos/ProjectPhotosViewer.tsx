
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface ProjectPhotosViewerProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectPhoto {
  id: string;
  file_path: string;
  description?: string;
  created_at: string;
}

export function ProjectPhotosViewer({ projectId, open, onOpenChange }: ProjectPhotosViewerProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);

  const { data: photos, isLoading, refetch } = useQuery({
    queryKey: ["project-photos", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_photos")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjectPhoto[];
    },
  });

  const handleDeletePhoto = async (photo: ProjectPhoto) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("project-photos")
        .remove([photo.file_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        toast.error("Failed to delete photo from storage");
        return;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("project_photos")
        .delete()
        .eq("id", photo.id);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        toast.error("Failed to delete photo record");
        return;
      }

      toast.success("Photo deleted successfully");
      setSelectedPhoto(null);
      refetch();
    } catch (error) {
      console.error('Error in handleDeletePhoto:', error);
      toast.error("Failed to delete photo");
    }
  };

  const navigatePhotos = (direction: 'prev' | 'next') => {
    if (!photos || !selectedPhoto) return;
    
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % photos.length 
      : (currentIndex - 1 + photos.length) % photos.length;

    setSelectedPhoto(photos[newIndex]);
  };

  if (isLoading) {
    return <div>Loading photos...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {selectedPhoto ? (
        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeletePhoto(selectedPhoto)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative group">
            <img
              src={`${supabase.storage.from("project-photos").getPublicUrl(selectedPhoto.file_path).data.publicUrl}`}
              alt="Selected project photo"
              className="w-full h-auto max-h-[70vh] object-contain mx-auto"
            />
            {photos && photos.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => navigatePhotos('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => navigatePhotos('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          {selectedPhoto.description && (
            <p className="mt-4 text-sm text-gray-500">{selectedPhoto.description}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos?.map((photo) => (
            <Card key={photo.id} className="p-4">
              <div className="aspect-video relative rounded-md overflow-hidden mb-3">
                <img
                  src={`${supabase.storage.from("project-photos").getPublicUrl(photo.file_path).data.publicUrl}`}
                  alt="Project photo"
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeletePhoto(photo)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {(!photos || photos.length === 0) && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No photos uploaded yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
