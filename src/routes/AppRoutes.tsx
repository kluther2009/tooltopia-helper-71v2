import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "@/pages/Index";
import AddTool from "@/pages/AddTool";
import EditTool from "@/pages/EditTool";
import Storage from "@/pages/Storage";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-tool"
        element={
          <ProtectedRoute>
            <AddTool />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-tool/:id"
        element={
          <ProtectedRoute>
            <EditTool />
          </ProtectedRoute>
        }
      />
      <Route
        path="/storage"
        element={
          <ProtectedRoute>
            <Storage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}