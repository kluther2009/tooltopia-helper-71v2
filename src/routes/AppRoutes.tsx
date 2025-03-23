
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import ResetPassword from "@/pages/ResetPassword";
import AddTool from "@/pages/AddTool";
import EditTool from "@/pages/EditTool";
import ToolList from "@/pages/ToolList";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import Settings from "@/pages/Settings";
import Storage from "@/pages/Storage";
import InitialInventory from "@/pages/InitialInventory";
import AddManual from "@/pages/AddManual";
import Landing from "@/pages/Landing";
import { Layout } from "@/components/Layout";
import { Outlet } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      
      {/* Auth routes without Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes wrapped in Layout */}
      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tool-overview" element={<Index />} />
        <Route path="/add-tool" element={<AddTool />} />
        <Route path="/edit-tool/:id" element={<EditTool />} />
        <Route path="/tool-list" element={<ToolList />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/initial-inventory" element={<InitialInventory />} />
        <Route path="/add-manual" element={<AddManual />} />
      </Route>

      {/* Catch all route - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
