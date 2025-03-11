
import { Wrench } from "lucide-react";

interface ToolStatusIconProps {
  status: "available" | "in-use" | "maintenance" | "loaned";
  onClick?: (e: React.MouseEvent) => void;
}

export function ToolStatusIcon({ status, onClick }: ToolStatusIconProps) {
  const getWrenchColor = () => {
    switch (status) {
      case "available":
        return "#22c55e"; // Green
      case "in-use":
        return "#ef4444"; // Red
      case "maintenance":
        return "#eab308"; // Yellow
      case "loaned":
        return "#0EA5E9"; // Ocean Blue
      default:
        return "#000000";
    }
  };

  return (
    <div 
      onClick={onClick} 
      className="cursor-pointer"
    >
      <Wrench 
        className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-1" 
        style={{ color: getWrenchColor() }}
      />
    </div>
  );
}
