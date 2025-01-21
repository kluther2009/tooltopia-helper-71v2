import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Settings from "@/pages/Settings";
import AddTool from "@/pages/AddTool";
import EditTool from "@/pages/EditTool";
import Storage from "@/pages/Storage";
import ToolList from "@/pages/ToolList";
import InitialInventory from "@/pages/InitialInventory";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/tool-overview" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes wrapped in Layout */}
      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tool-overview" element={<Index />} />
        <Route path="/add-tool" element={<AddTool />} />
        <Route path="/edit-tool/:id" element={<EditTool />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/tool-list" element={<ToolList />} />
        <Route path="/initial-inventory" element={<InitialInventory />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}