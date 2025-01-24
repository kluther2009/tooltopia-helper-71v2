import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

  if (isLoading) {
    return <div>Loading photos...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Project Photos</h2>
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
              <img
                src={`${supabase.storage.from("project-photos").getPublicUrl(selectedPhoto.file_path).data.publicUrl}`}
                alt="Selected project photo"
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
              {selectedPhoto.description && (
                <p className="mt-4 text-sm text-gray-500">{selectedPhoto.description}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos?.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square cursor-pointer group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={`${supabase.storage.from("project-photos").getPublicUrl(photo.file_path).data.publicUrl}`}
                    alt="Project photo"
                    className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                  />
                </div>
              ))}
              {photos?.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No photos uploaded yet
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}