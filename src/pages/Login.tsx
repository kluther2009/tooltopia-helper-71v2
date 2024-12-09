import { Layout } from "@/components/Layout";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current auth session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    checkSession();

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

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
                    brandButtonText: "white",
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