import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarMenuItemProps {
  label: string;
  icon: LucideIcon;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
  isDialog?: boolean;
  onClick?: () => void;
}

export function SidebarMenuItem({
  label,
  icon: Icon,
  href,
  isActive,
  isCollapsed,
  isDialog,
  onClick,
}: SidebarMenuItemProps) {
  const buttonContent = (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      className={cn(
        "w-full justify-start text-white hover:text-white text-xs sm:text-sm min-h-8 sm:min-h-9",
        isCollapsed && "justify-center px-1.5 sm:px-2",
        isActive && "bg-primary"
      )}
      onClick={onClick}
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      {!isCollapsed && (
        <span className="ml-1.5 sm:ml-2 truncate">
          {label}
        </span>
      )}
    </Button>
  );

  if (isDialog) {
    return buttonContent;
  }

  return (
    <Link to={href}>
      {buttonContent}
    </Link>
  );
}