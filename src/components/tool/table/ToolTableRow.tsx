import { format } from "date-fns";
import { FileText, Image } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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

interface ToolTableRowProps {
  tool: Tool;
  onFileClick: (filePath: string) => void;
}

export function ToolTableRow({ tool, onFileClick }: ToolTableRowProps) {
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
    <TableRow className="hover:bg-muted/50 transition-colors">
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
  );
}