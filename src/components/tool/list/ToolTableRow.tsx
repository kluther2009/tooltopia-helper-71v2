import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { FileText, Image } from "lucide-react";
import { format } from "date-fns";
import { Tool } from "../types/Tool";

interface ToolTableRowProps {
  tool: Tool;
  onFileOpen: (filePath: string) => void;
  onPhotoView: (location: string) => void;
}

export function ToolTableRow({ tool, onFileOpen, onPhotoView }: ToolTableRowProps) {
  return (
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
            onClick={() => onFileOpen(tool.warranty_file_path!)}
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
            onClick={() => onFileOpen(tool.receipt_file_path!)}
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
          onClick={() => onPhotoView(tool.location)}
        >
          <Image className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}