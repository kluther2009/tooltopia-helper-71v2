import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LocationPhotoViewer } from "../photos/LocationPhotoViewer";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tool } from "../tool/types/Tool";

interface ProjectToolsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectToolsDialog({ projectId, open, onOpenChange }: ProjectToolsDialogProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [selectedToolLocation, setSelectedToolLocation] = useState<string | null>(null);

  const { data: projectTools, isLoading } = useQuery({
    queryKey: ["project-tools", projectId],
    queryFn: async () => {
      const { data: toolsData, error } = await supabase
        .from("project_tools")
        .select(`
          tool:tools (
            id,
            name,
            location,
            status,
            warranty_file_path,
            receipt_file_path
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error("Error fetching tools:", error);
        throw error;
      }

      return toolsData?.map(item => item.tool) as Tool[];
    },
    enabled: open,
  });

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Project Tools</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            {isLoading ? (
              <div className="text-center py-4">Loading tools...</div>
            ) : (
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
                  {(projectTools || []).map((tool) => (
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
            )}
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