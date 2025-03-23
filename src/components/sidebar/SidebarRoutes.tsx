
import {
  LayoutDashboard,
  Settings,
  BoxSelect,
  Plus,
  ClipboardList,
  MessageSquare,
  FolderPlus,
  Table,
  Grid,
} from "lucide-react";

export const sidebarRoutes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Tool Overview",
    icon: Grid,
    href: "/tool-overview",
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
    label: "Tool List",
    icon: Table,
    href: "/tool-list",
  },
  {
    label: "Visual Inventory",
    icon: ClipboardList,
    href: "/initial-inventory",
  },
  {
    label: "My Projects",
    icon: FolderPlus,
    href: "/projects",
  },
  {
    label: "ToolGuru",
    icon: MessageSquare,
    href: "#",
    isDialog: true,
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];
