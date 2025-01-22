import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ProjectPhotoViewerDialog } from "./ProjectPhotoViewerDialog";

interface ProjectPhoto {
  id: string;
  file_path: string;
  created_at: string;
  description: string | null;
}

interface ProjectPhotosListProps {
  projectId: string;
  photos: ProjectPhoto[];
  onDeletePhoto: (photoId: string) => void;
}

export function ProjectPhotosList({ projectId, photos, onDeletePhoto }: ProjectPhotosListProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);

  if (!photos.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No photos added yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="p-4">
          <div 
            className="aspect-video relative rounded-md overflow-hidden mb-3 cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={`${supabase.storage.from('project-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
              alt="Project photo"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {new Date(photo.created_at).toLocaleDateString()}
            </p>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDeletePhoto(photo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      <ProjectPhotoViewerDialog
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}