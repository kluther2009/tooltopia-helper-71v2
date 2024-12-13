import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationStatus } from "@/components/VerificationStatus";
import { Loader2 } from "lucide-react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Handle email verification confirmation
  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    
    if (token_hash && type === 'email_verification') {
      verifyEmail(token_hash);
    }
  }, [searchParams]);

  const verifyEmail = async (token_hash: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'signup' // Changed from 'email_verification' to 'signup'
      });

      if (error) {
        setVerificationStatus('error');
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: error.message
        });
      } else {
        setVerificationStatus('success');
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified. You can now sign in."
        });
        // Redirect to login after a short delay
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setVerificationStatus('error');
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "There was an error verifying your email."
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/signup`
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        setVerificationStatus('pending');
        toast({
          title: "Success",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show verification status if present
  if (verificationStatus) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4 sm:px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-card-foreground">
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VerificationStatus status={verificationStatus} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4 sm:px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-6">
          <CardTitle className="text-5xl sm:text-6xl font-bold text-primary mb-8 font-serif tracking-wider">
            ToolTrackerHub
          </CardTitle>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground">
              Create Account
            </h2>
            <div className="h-1 w-24 bg-primary mx-auto mt-6 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="bg-background/50 text-card-foreground border-card-foreground/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="bg-background/50 text-card-foreground border-card-foreground/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="bg-background/50 text-card-foreground border-card-foreground/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background/50 text-card-foreground border-card-foreground/20"
                required
                minLength={6}
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <div className="text-center">
              <a
                href="/login"
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                Already have an account? Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}