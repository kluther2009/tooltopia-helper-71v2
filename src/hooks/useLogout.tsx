import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First clear all storage to ensure no stale data remains
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });

      try {
        // Attempt to sign out, but don't wait for it since the session might be invalid
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        // Ignore any errors during sign out since we're clearing everything anyway
        console.log("Sign out error (ignored):", error);
      }

      // Force reload to clear any remaining state and redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error("Error during logout cleanup:", error);
      toast.error("Error during logout");
      // Force reload to login anyway
      window.location.href = '/login';
    }
  };

  return { handleLogout };
};