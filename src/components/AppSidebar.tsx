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
  Plus
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
        "flex h-screen",
        isCollapsed ? "w-12 sm:w-16" : "w-44 sm:w-56",
        "flex-col gap-4 border-r border-border bg-card p-2 transition-all duration-300 shrink-0 overflow-y-auto"
      )}
    >
      <div className="flex flex-1 flex-col gap-2 sm:gap-4">
        {routes.map((route) => (
          <Link key={route.href} to={route.href}>
            <Button
              variant={location.pathname === route.href ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-white hover:text-white text-xs sm:text-sm h-8 sm:h-10",
                isCollapsed && "justify-center px-2 sm:px-4",
                location.pathname === route.href && "bg-primary"
              )}
            >
              <route.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              {!isCollapsed && <span className="ml-2 truncate">{route.label}</span>}
            </Button>
          </Link>
        ))}
      </div>
      <Button
        variant="destructive"
        className={cn(
          "w-full justify-start bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm h-8 sm:h-10",
          isCollapsed && "justify-center px-2 sm:px-4"
        )}
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        {!isCollapsed && <span className="ml-2 truncate">Logout</span>}
      </Button>
    </aside>
  );
}