import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LocationPhotoViewer } from "../photos/LocationPhotoViewer";
import { Tool, SortConfig } from "./types/Tool";
import { ToolTableHeader } from "./list/ToolTableHeader";
import { ToolTableRow } from "./list/ToolTableRow";

export function ToolListView() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [selectedToolLocation, setSelectedToolLocation] = useState<string | null>(null);

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*');
      
      if (error) {
        toast.error("Failed to fetch tools");
        throw error;
      }

      return data as Tool[];
    },
  });

  const sortedTools = [...tools].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (sortConfig.direction === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const handleSort = (key: keyof Tool) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openFile = async (filePath: string) => {
    if (!filePath) return;
    
    const { data } = supabase.storage
      .from('warranty-files')
      .getPublicUrl(filePath);
    
    if (data.publicUrl) {
      setSelectedFile(data.publicUrl);
      setIsDialogOpen(true);
    }
  };

  const openPhotoViewer = (location: string) => {
    setSelectedToolLocation(location);
    setIsPhotoViewerOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading tools...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="rounded-md border">
        <Table>
          <ToolTableHeader onSort={handleSort} />
          <TableBody>
            {sortedTools.map((tool) => (
              <ToolTableRow
                key={tool.id}
                tool={tool}
                onFileOpen={openFile}
                onPhotoView={openPhotoViewer}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
    </div>
  );
}