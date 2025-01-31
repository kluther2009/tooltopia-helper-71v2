import { FileText, Book } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ToolStatusBadge } from "./ToolStatusBadge";
import { useToolAnnotation } from "./hooks/useToolAnnotation";
import { AnnotationDialog } from "./annotation/AnnotationDialog";

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
              onClick={() => {
                console.log("View manual with ID:", tool.manual_id);
                // TODO: Implement manual viewing functionality
              }}
              className="hover:bg-muted"
            >
              <Book className="h-4 w-4 text-primary" />
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