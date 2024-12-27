import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHeader } from "@/components/auth/LoginHeader";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          await supabase.auth.signOut();
          localStorage.clear();
          console.error("Session error:", error);
          return;
        }

        if (session) {
          navigate("/");
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        localStorage.clear();
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4 sm:px-6">
      <div className="w-full max-w-sm space-y-8">
        <LoginHeader />
        <LoginForm onLoginSuccess={() => navigate("/")} />
      </div>
    </div>
  );
}