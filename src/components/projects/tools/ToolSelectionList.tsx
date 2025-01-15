import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface Tool {
  id: string;
  name: string;
}

interface ToolSelectionListProps {
  tools: Tool[];
  title: string;
  selectedTool: string | null;
  onToolSelect: (id: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function ToolSelectionList({ 
  tools, 
  title, 
  selectedTool, 
  onToolSelect,
  searchValue,
  onSearchChange
}: ToolSelectionListProps) {
  return (
    <Card className="flex-1 p-4">
      <h3 className="font-medium mb-3 text-sm text-gray-700">{title}</h3>
      <Input
        type="search"
        placeholder="Search tools..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-3"
      />
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm transition-colors
                ${selectedTool === tool.id ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
            >
              {tool.name}
            </div>
          ))}
          {tools.length === 0 && (
            <div className="text-center text-gray-500 py-4 text-sm">
              No tools available
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}