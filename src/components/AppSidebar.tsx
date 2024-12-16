import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import {
  LayoutGrid,
  Settings,
  BoxSelect,
  LogOut,
  Plus,
  ClipboardList
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutGrid,
    href: "/",
  },
  {
    label: "Add Tool",
    icon: Plus,
    href: "/add-tool",
  },
  {
    label: "Storage",
    icon: BoxSelect,
    href: "/storage",
  },
  {
    label: "Initial Inventory",
    icon: ClipboardList,
    href: "/initial-inventory",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { handleLogout } = useLogout();

  const isCollapsed = state === "collapsed";

  return (
    <aside
      className={cn(
        "flex-shrink-0 h-[100dvh] flex flex-col border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-10 sm:w-14" : "w-40 sm:w-52",
      )}
    >
      <div className="flex-1 overflow-y-auto p-1.5 sm:p-2">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {routes.map((route) => (
            <Link key={route.href} to={route.href}>
              <Button
                variant={location.pathname === route.href ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start text-white hover:text-white text-xs sm:text-sm min-h-8 sm:min-h-9",
                  isCollapsed && "justify-center px-1.5 sm:px-2",
                  location.pathname === route.href && "bg-primary"
                )}
              >
                <route.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {!isCollapsed && (
                  <span className="ml-1.5 sm:ml-2 truncate">
                    {route.label}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="p-1.5 sm:p-2">
        <Button
          variant="destructive"
          size="sm"
          className={cn(
            "w-full justify-start bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm min-h-8 sm:min-h-9",
            isCollapsed && "justify-center px-1.5 sm:px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {!isCollapsed && (
            <span className="ml-1.5 sm:ml-2 truncate">
              Logout
            </span>
          )}
        </Button>
      </div>
    </aside>
  );
}