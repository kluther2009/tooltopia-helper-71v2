import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Tool } from "../types/Tool";

interface ToolTableHeaderProps {
  onSort: (key: keyof Tool) => void;
}

export function ToolTableHeader({ onSort }: ToolTableHeaderProps) {
  const renderSortButton = (label: string, key: keyof Tool) => (
    <Button
      variant="ghost"
      onClick={() => onSort(key)}
      className="h-8 text-xs font-medium"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
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
  );
}