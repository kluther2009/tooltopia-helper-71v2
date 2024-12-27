import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid refresh token')) {
          await supabase.auth.signOut();
          localStorage.clear();
        }
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        onLoginSuccess();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during login",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address first",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Success",
          description: "Password reset email sent. Please check your inbox.",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-lg text-card-foreground">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full bg-background/50 text-card-foreground border-card-foreground/20"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-lg text-card-foreground">
          Your Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className="w-full bg-background/50 text-card-foreground border-card-foreground/20"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full text-lg py-6"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="space-y-4 text-center">
        <button
          onClick={handleForgotPassword}
          disabled={resetLoading}
          className="text-muted-foreground hover:text-card-foreground transition-colors"
        >
          {resetLoading ? "Sending reset email..." : "Forgot your password?"}
        </button>
        <a
          href="/signup"
          className="block text-muted-foreground hover:text-card-foreground transition-colors"
        >
          Don't have an account? Sign up
        </a>
      </div>
    </form>
  );
}