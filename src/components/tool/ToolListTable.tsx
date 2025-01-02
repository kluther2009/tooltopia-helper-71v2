import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Tool {
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
}

interface SortConfig {
  key: keyof Tool;
  direction: 'asc' | 'desc';
}

export function ToolListTable() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*');

    if (error) {
      console.error('Error fetching tools:', error);
      return;
    }

    if (data) {
      setTools(data);
    }
  };

  const handleSort = (key: keyof Tool) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedTools = [...tools].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === 'asc'
      ? (aValue < bValue ? -1 : 1)
      : (bValue < aValue ? -1 : 1);
  });

  const openFile = async (filePath: string) => {
    const { data } = supabase.storage
      .from('warranty-files')
      .getPublicUrl(filePath);
    
    if (data.publicUrl) {
      setSelectedFile(data.publicUrl);
      setIsFileDialogOpen(true);
    }
  };

  const renderSortIcon = (key: keyof Tool) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const renderStatus = (status: string) => {
    const statusColors = {
      'available': 'bg-green-500',
      'in-use': 'bg-blue-500',
      'maintenance': 'bg-yellow-500'
    };

    return (
      <Badge 
        variant="secondary" 
        className={`${statusColors[status as keyof typeof statusColors]} text-white font-medium`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="bg-card rounded-lg shadow-md border border-border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-card/50">
              {[
                { key: 'name', label: 'Tool Name' },
                { key: 'location', label: 'Primary Location' },
                { key: 'sub_location_a', label: 'Sub Location' },
                { key: 'sub_location_b', label: 'Specific Location' },
                { key: 'status', label: 'Status' },
                { key: 'purchase_date', label: 'Purchase Date' },
                { key: 'warranty_length', label: 'Warranty Length' }
              ].map(({ key, label }) => (
                <TableHead 
                  key={key}
                  className="cursor-pointer hover:bg-muted/50 transition-colors text-card-foreground font-semibold"
                  onClick={() => handleSort(key as keyof Tool)}
                >
                  {label} {renderSortIcon(key as keyof Tool)}
                </TableHead>
              ))}
              <TableHead className="text-card-foreground font-semibold">Warranty</TableHead>
              <TableHead className="text-card-foreground font-semibold">Receipt</TableHead>
              <TableHead className="text-card-foreground font-semibold">Picture</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTools.map((tool) => (
              <TableRow 
                key={tool.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium text-card-foreground">{tool.name}</TableCell>
                <TableCell className="text-card-foreground">{tool.location}</TableCell>
                <TableCell className="text-card-foreground">{tool.sub_location_a || '-'}</TableCell>
                <TableCell className="text-card-foreground">{tool.sub_location_b || '-'}</TableCell>
                <TableCell>{renderStatus(tool.status)}</TableCell>
                <TableCell className="text-card-foreground">
                  {tool.purchase_date 
                    ? format(new Date(tool.purchase_date), 'MM/dd/yyyy')
                    : '-'}
                </TableCell>
                <TableCell className="text-card-foreground">
                  {tool.warranty_length ? `${tool.warranty_length} months` : '-'}
                </TableCell>
                <TableCell>
                  {tool.warranty_file_path && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openFile(tool.warranty_file_path!)}
                      className="hover:bg-muted"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {tool.receipt_file_path && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openFile(tool.receipt_file_path!)}
                      className="hover:bg-muted"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* TODO: Implement photo viewer */}}
                    className="hover:bg-muted"
                  >
                    <Image className="h-4 w-4 text-primary" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent className="max-w-3xl bg-card">
          {selectedFile && (
            <img 
              src={selectedFile} 
              alt="Document Preview" 
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
