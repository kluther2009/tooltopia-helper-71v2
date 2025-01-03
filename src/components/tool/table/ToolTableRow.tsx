import { FileText, Image } from "lucide-react";
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
          {tool.warranty_file_path && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFileClick(tool.warranty_file_path!)}
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
              onClick={() => onFileClick(tool.receipt_file_path!)}
              className="hover:bg-muted"
            >
              <FileText className="h-4 w-4 text-primary" />
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