import { Layout } from "@/components/Layout";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <div className="space-y-8 bg-card p-8 rounded-lg shadow-lg border border-border">
          <div className="space-y-2 text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-2">
                Tool Inventory System
              </h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded" />
            </div>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </Layout>
  );
}