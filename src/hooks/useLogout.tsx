import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First attempt to kill all sessions
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      // Force reload the page to clear any remaining state
      window.location.href = '/login';
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error logging out");
      // Force reload to login anyway
      window.location.href = '/login';
    }
  };

  return { handleLogout };
};