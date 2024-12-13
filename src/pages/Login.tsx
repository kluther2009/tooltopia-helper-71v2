import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      navigate("/");
    }
    setLoading(false);
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
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4 sm:px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-8 font-serif tracking-wider">
            ToolTrackerHub
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary">
            Tool Inventory System
          </h2>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
        </div>

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
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

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
      </div>
    </div>
  );
}