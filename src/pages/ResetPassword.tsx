import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Check for access_token in URL when component mounts
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (access_token && type === 'recovery') {
      // Set the session using the recovery tokens
      supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || '',
      });
    } else {
      // No valid recovery token found
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid or expired password reset link. Please request a new one.",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: password
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
        description: "Your password has been updated successfully",
      });
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4 sm:px-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-6">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-primary">
            Reset Password
          </CardTitle>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-lg text-card-foreground">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-background/50 text-card-foreground border-card-foreground/20"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-lg text-card-foreground">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-background/50 text-card-foreground border-card-foreground/20"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-lg py-6"
              disabled={loading}
            >
              {loading ? "Updating password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}