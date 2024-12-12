import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Image, Trash2, Upload } from "lucide-react";

interface LocationPhoto {
  id: string;
  location: string;
  file_path: string;
  created_at: string;
}

export function LocationPhotoManager() {
  const [photos, setPhotos] = useState<LocationPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<LocationPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('location_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch photos');
      return;
    }

    setPhotos(data);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const location = prompt('Enter location name for this photo:');
    if (!location) {
      setIsUploading(false);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('location-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save photo metadata to database
      const { error: dbError } = await supabase
        .from('location_photos')
        .insert({
          location,
          file_path: filePath,
        });

      if (dbError) throw dbError;

      toast.success('Photo uploaded successfully');
      fetchPhotos();
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: LocationPhoto) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('location-photos')
        .remove([photo.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('location_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      toast.success('Photo deleted successfully');
      fetchPhotos();
    } catch (error) {
      toast.error('Failed to delete photo');
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Location Photos</h2>
        <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Photo
        </Button>
        <Input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>

      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="p-4">
              <div className="aspect-video relative rounded-md overflow-hidden mb-3">
                <img
                  src={`${supabase.storage.from('location-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
                  alt={photo.location}
                  className="object-cover w-full h-full"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setIsViewerOpen(true);
                  }}
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
                  onClick={() => handleDeletePhoto(photo)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.location}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="aspect-video relative rounded-md overflow-hidden">
              <img
                src={`${supabase.storage.from('location-photos').getPublicUrl(selectedPhoto.file_path).data.publicUrl}`}
                alt={selectedPhoto.location}
                className="object-contain w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}