import { ScrollArea } from "@/components/ui/scroll-area";
import { Tool } from "@/hooks/useTools";

interface ToolSelectionListProps {
  title: string;
  tools: Tool[];
  selectedTools: string[];
  onToolSelect: (toolId: string) => void;
}

export function ToolSelectionList({
  title,
  tools,
  selectedTools,
  onToolSelect,
}: ToolSelectionListProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-2">{title}</h3>
      <ScrollArea className="h-[300px]">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`p-2 cursor-pointer rounded ${
              selectedTools.includes(tool.id)
                ? "bg-slate-200"
                : "hover:bg-slate-100"
            }`}
            onClick={() => onToolSelect(tool.id)}
          >
            {tool.name}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}