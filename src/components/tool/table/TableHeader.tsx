import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface TableHeaderProps {
  onSort: (key: string) => void;
  sortConfig: SortConfig;
}

export function ToolTableHeader({ onSort, sortConfig }: TableHeaderProps) {
  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const headers = [
    { key: 'name', label: 'Tool Name' },
    { key: 'location', label: 'Primary Location' },
    { key: 'sub_location_a', label: 'Sub Location' },
    { key: 'sub_location_b', label: 'Specific Location' },
    { key: 'status', label: 'Status' },
    { key: 'purchase_date', label: 'Purchase Date' },
    { key: 'warranty_length', label: 'Warranty Length' }
  ];

  return (
    <TableHeader>
      <TableRow className="hover:bg-card/50">
        {headers.map(({ key, label }) => (
          <TableHead 
            key={key}
            className="cursor-pointer hover:bg-muted/50 transition-colors text-card-foreground font-semibold"
            onClick={() => onSort(key)}
          >
            {label} {renderSortIcon(key)}
          </TableHead>
        ))}
        <TableHead className="text-card-foreground font-semibold">Warranty</TableHead>
        <TableHead className="text-card-foreground font-semibold">Manual</TableHead>
        <TableHead className="text-card-foreground font-semibold">Picture</TableHead>
      </TableRow>
    </TableHeader>
  );
}