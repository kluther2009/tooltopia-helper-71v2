import { Badge } from "@/components/ui/badge";

interface ToolStatusBadgeProps {
  status: string;
}

export function ToolStatusBadge({ status }: ToolStatusBadgeProps) {
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
}