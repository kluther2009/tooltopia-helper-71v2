import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, FileText, Image } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";

type Tool = {
  id: string;
  name: string;
  location: string;
  sub_location_a: string | null;
  sub_location_b: string | null;
  status: string;
  purchase_date: string | null;
  warranty_length: number | null;
  warranty_file_path: string | null;
  receipt_file_path: string | null;
};

type SortConfig = {
  key: keyof Tool;
  direction: 'asc' | 'desc';
};

export function ToolListView() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const renderSortButton = (label: string, key: keyof Tool) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(key)}
      className="h-8 text-xs font-medium"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading tools...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{renderSortButton('Tool Name', 'name')}</TableHead>
              <TableHead>{renderSortButton('Primary Location', 'location')}</TableHead>
              <TableHead>{renderSortButton('Sub Location', 'sub_location_a')}</TableHead>
              <TableHead>{renderSortButton('Specific Location', 'sub_location_b')}</TableHead>
              <TableHead>{renderSortButton('Status', 'status')}</TableHead>
              <TableHead>{renderSortButton('Purchase Date', 'purchase_date')}</TableHead>
              <TableHead>{renderSortButton('Warranty Length', 'warranty_length')}</TableHead>
              <TableHead>Warranty</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Picture</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell>{tool.location}</TableCell>
                <TableCell>{tool.sub_location_a || '-'}</TableCell>
                <TableCell>{tool.sub_location_b || '-'}</TableCell>
                <TableCell>{tool.status}</TableCell>
                <TableCell>
                  {tool.purchase_date ? format(new Date(tool.purchase_date), 'MM/dd/yyyy') : '-'}
                </TableCell>
                <TableCell>{tool.warranty_length ? `${tool.warranty_length} months` : '-'}</TableCell>
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
                    onClick={() => {
                      // TODO: Implement photo viewer for tool annotations
                      toast.info("Photo viewer coming soon!");
                    }}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
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
    </div>
  );
}