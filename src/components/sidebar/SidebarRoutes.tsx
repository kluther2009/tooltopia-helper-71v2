import {
  LayoutGrid,
  Settings,
  BoxSelect,
  Plus,
  ClipboardList,
  MessageSquare,
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
    label: "Initial Inventory",
    icon: ClipboardList,
    href: "/initial-inventory",
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