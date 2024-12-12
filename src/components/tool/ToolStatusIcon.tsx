import { Wrench } from "lucide-react";

interface ToolStatusIconProps {
  status: "available" | "in-use" | "maintenance";
}

export function ToolStatusIcon({ status }: ToolStatusIconProps) {
  const getWrenchColor = () => {
    switch (status) {
      case "available":
        return "#22c55e"; // Green
      case "in-use":
        return "#ef4444"; // Red
      case "maintenance":
        return "#eab308"; // Yellow
      default:
        return "#000000";
    }
  };

  return (
    <Wrench 
      className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-1" 
      style={{ color: getWrenchColor() }}
    />
  );
}