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
    return null;
  }

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto px-4 mt-4 sm:mt-8">
        <div className="space-y-6 bg-card p-6 sm:p-8 rounded-lg shadow-lg border border-border">
          <div className="space-y-2 text-center">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-2">
                Tool Inventory System
              </h2>
              <div className="h-1 w-16 sm:w-20 bg-primary mx-auto rounded" />
            </div>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#f97316',
                    brandAccent: '#f97316',
                    brandButtonText: "white",
                    inputText: "white",
                    inputBackground: "transparent",
                    inputBorder: "hsl(var(--border))",
                    inputLabelText: "white",
                    messageText: "white",
                  },
                },
              },
              className: {
                button: "text-white w-full py-2",
                input: "bg-transparent border-border text-foreground w-full p-2 text-base",
                label: "text-foreground text-sm",
                message: "text-foreground text-sm",
                anchor: "text-primary hover:text-primary/80 text-sm",
                container: "w-full",
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </Layout>
  );
}