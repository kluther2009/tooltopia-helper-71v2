import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LocationPhotoViewer } from "../photos/LocationPhotoViewer";
import { useState } from "react";

interface Tool {
  id: string;
  name: string;
  location: string;
  status: string;
  warranty_file_path?: string | null;
  receipt_file_path?: string | null;
}

interface ProjectToolsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
  projectName: string;
}

export function ProjectToolsDialog({ isOpen, onClose, tools, projectName }: ProjectToolsDialogProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [selectedToolLocation, setSelectedToolLocation] = useState<string | null>(null);

  const openFile = async (filePath: string) => {
    if (!filePath) return;
    
    const { data } = supabase.storage
      .from('warranty-files')
      .getPublicUrl(filePath);
    
    if (data.publicUrl) {
      setSelectedFile(data.publicUrl);
      setIsFileDialogOpen(true);
    }
  };

  const openPhotoViewer = (location: string) => {
    setSelectedToolLocation(location);
    setIsPhotoViewerOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tools for {projectName}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Picture</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell>{tool.location}</TableCell>
                    <TableCell>{tool.status}</TableCell>
                    <TableCell>
                      {tool.warranty_file_path ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openFile(tool.warranty_file_path!)}
                          className="h-8 w-8 p-0"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {tool.receipt_file_path ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openFile(tool.receipt_file_path!)}
                          className="h-8 w-8 p-0"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openPhotoViewer(tool.location)}
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedFile && (
            <img
              src={selectedFile}
              alt="Document"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>

      <LocationPhotoViewer
        location={selectedToolLocation}
        isOpen={isPhotoViewerOpen}
        onClose={() => {
          setIsPhotoViewerOpen(false);
          setSelectedToolLocation(null);
        }}
      />
    </>
  );
}