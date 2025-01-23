import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

  const { data: photos, isLoading } = useQuery({
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
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 z-10"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
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