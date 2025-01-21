import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProjectPhoto {
  id: string;
  file_path: string;
  description: string | null;
}

interface ProjectPhotosListProps {
  projectId: string;
}

export function ProjectPhotosList({ projectId }: ProjectPhotosListProps) {
  const { data: photos, refetch } = useQuery({
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

  const handleDeletePhoto = async (photoId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("project-photos")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("project_photos")
        .delete()
        .eq("id", photoId);

      if (dbError) throw dbError;

      toast.success("Photo deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo");
    }
  };

  if (!photos?.length) {
    return (
      <div className="text-sm text-slate-400">
        No photos added yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group">
          <AspectRatio ratio={4/3} className="bg-slate-900 rounded-lg overflow-hidden">
            <img
              src={`${supabase.storageUrl}/object/public/project-photos/${photo.file_path}`}
              alt={photo.description || "Project photo"}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleDeletePhoto(photo.id, photo.file_path)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}