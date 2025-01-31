import { FileText, Book, Image } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ToolStatusBadge } from "./ToolStatusBadge";
import { useToolAnnotation } from "./hooks/useToolAnnotation";
import { AnnotationDialog } from "./annotation/AnnotationDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  manual_id: string | null;
}

interface ToolTableRowProps {
  tool: Tool;
  onFileClick: (filePath: string) => void;
}

export function ToolTableRow({ tool, onFileClick }: ToolTableRowProps) {
  const {
    hasAnnotation,
    annotationData,
    isAnnotationDialogOpen,
    setIsAnnotationDialogOpen
  } = useToolAnnotation(tool.id);

  const hasWarrantyDocs = tool.warranty_file_path || tool.receipt_file_path;

  const handleManualClick = async () => {
    if (!tool.manual_id) return;

    try {
      const { data: manualData, error: manualError } = await supabase
        .from('manuals')
        .select('file_path')
        .eq('id', tool.manual_id)
        .single();

      if (manualError) throw manualError;
      
      if (manualData?.file_path) {
        const { data } = supabase.storage
          .from('warranty-files')
          .getPublicUrl(manualData.file_path);
        
        if (data.publicUrl) {
          window.open(data.publicUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error opening manual:', error);
      toast.error('Failed to open manual');
    }
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50 transition-colors">
        <TableCell className="font-medium text-card-foreground">{tool.name}</TableCell>
        <TableCell className="text-card-foreground">{tool.location}</TableCell>
        <TableCell className="text-card-foreground">{tool.sub_location_a || '-'}</TableCell>
        <TableCell className="text-card-foreground">{tool.sub_location_b || '-'}</TableCell>
        <TableCell><ToolStatusBadge status={tool.status} /></TableCell>
        <TableCell className="text-card-foreground">
          {tool.purchase_date 
            ? format(new Date(tool.purchase_date), 'MM/dd/yyyy')
            : '-'}
        </TableCell>
        <TableCell className="text-card-foreground">
          {tool.warranty_length ? `${tool.warranty_length} months` : '-'}
        </TableCell>
        <TableCell>
          {hasWarrantyDocs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (tool.warranty_file_path) {
                  onFileClick(tool.warranty_file_path);
                } else if (tool.receipt_file_path) {
                  onFileClick(tool.receipt_file_path);
                }
              }}
              className="hover:bg-muted"
            >
              <FileText className="h-4 w-4 text-primary" />
            </Button>
          )}
        </TableCell>
        <TableCell>
          {tool.manual_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualClick}
              className="hover:bg-muted"
            >
              <Book className="h-4 w-4 text-primary" />
            </Button>
          )}
        </TableCell>
        <TableCell>
          {hasAnnotation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAnnotationDialogOpen(true)}
              className="hover:bg-muted"
            >
              <Image className="h-4 w-4 text-primary" />
            </Button>
          )}
        </TableCell>
      </TableRow>

      <AnnotationDialog
        isOpen={isAnnotationDialogOpen}
        onOpenChange={setIsAnnotationDialogOpen}
        annotation={annotationData}
      />
    </>
  );
}