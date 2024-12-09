import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Sign out with scope: 'global' to kill all sessions
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });

      if (error) {
        console.error("Logout error:", error);
        toast.error("Error logging out");
        return;
      }

      // Clear any local storage items that might be persisting the session
      localStorage.clear();
      
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error logging out");
      // Redirect to login anyway as a fallback
      navigate("/login");
    }
  };

  return { handleLogout };
};