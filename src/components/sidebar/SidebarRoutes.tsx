import {
  LayoutGrid,
  Settings,
  BoxSelect,
  Plus,
  ClipboardList,
  MessageSquare,
  FolderPlus,
} from "lucide-react";

export const sidebarRoutes = [
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