import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { EmailVerificationCard } from "@/components/auth/EmailVerificationCard";

export default function SignUp() {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

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
        type: 'signup'
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

  if (verificationStatus) {
    return <EmailVerificationCard status={verificationStatus} />;
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
          <SignUpForm onSignUpSuccess={() => setVerificationStatus('pending')} />
        </CardContent>
      </Card>
    </div>
  );
}