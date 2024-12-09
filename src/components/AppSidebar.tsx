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
        isCollapsed ? "w-16" : "w-56",
        "flex-col gap-4 border-r border-border bg-card p-2 transition-all duration-300"
      )}
    >
      <div className="flex flex-1 flex-col gap-4">
        {routes.map((route) => (
          <Link key={route.href} to={route.href}>
            <Button
              variant={location.pathname === route.href ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center"
              )}
            >
              <route.icon />
              {!isCollapsed && <span className="ml-2">{route.label}</span>}
            </Button>
          </Link>
        ))}
      </div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-destructive hover:text-destructive",
          isCollapsed && "justify-center"
        )}
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        {!isCollapsed && <span className="ml-2">Logout</span>}
      </Button>
    </aside>
  );
}