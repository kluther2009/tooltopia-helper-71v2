import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AddTool from "@/pages/AddTool";
import EditTool from "@/pages/EditTool";
import Storage from "@/pages/Storage";
import InitialInventory from "@/pages/InitialInventory";
import Projects from "@/pages/Projects";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import ResetPassword from "@/pages/ResetPassword";
import ToolList from "@/pages/ToolList";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/add-tool" element={<AddTool />} />
      <Route path="/edit-tool/:id" element={<EditTool />} />
      <Route path="/storage" element={<Storage />} />
      <Route path="/tool-list" element={<ToolList />} />
      <Route path="/initial-inventory" element={<InitialInventory />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}