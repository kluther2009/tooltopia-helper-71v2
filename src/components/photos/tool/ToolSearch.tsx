import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface ToolSearchProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearch: () => void
  isLoading: boolean
}

export function ToolSearch({ searchQuery, onSearchChange, onSearch, isLoading }: ToolSearchProps) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Search tools..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      />
      <Button onClick={onSearch} disabled={isLoading}>
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}