import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

export default function AddManual() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = location.state?.returnTo || "/";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 25MB limit");
      e.target.value = ''; // Reset input
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !file) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('warranty-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create the manual record
      const { error: insertError } = await supabase
        .from('manuals')
        .insert({
          make,
          model,
          file_path: data?.path,
          added_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (insertError) throw insertError;

      toast.success("Manual added successfully");
      navigate(returnPath);
    } catch (error) {
      console.error('Error adding manual:', error);
      toast.error("Failed to add manual");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Manual</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="make" className="block text-sm font-medium mb-1">
              Make *
            </label>
            <Input
              id="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Enter make"
              required
            />
          </div>
          
          <div>
            <label htmlFor="model" className="block text-sm font-medium mb-1">
              Model *
            </label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Enter model"
              required
            />
          </div>
          
          <div>
            <label htmlFor="manual-file" className="block text-sm font-medium mb-1">
              Manual File * (Max 25MB)
            </label>
            <Input
              id="manual-file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(returnPath)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Manual"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}