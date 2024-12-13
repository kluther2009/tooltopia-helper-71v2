import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Mail, AlertCircle } from "lucide-react";

interface VerificationStatusProps {
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export function VerificationStatus({ status, message }: VerificationStatusProps) {
  const statusConfig = {
    pending: {
      icon: Mail,
      title: "Check your email",
      description: "We've sent you a verification link. Please check your inbox.",
      variant: "default" as const,
    },
    success: {
      icon: CheckCircle2,
      title: "Email verified",
      description: "Your email has been successfully verified.",
      variant: "default" as const,
    },
    error: {
      icon: AlertCircle,
      title: "Verification failed",
      description: message || "There was an error verifying your email.",
      variant: "destructive" as const,
    },
  };

  const config = statusConfig[status];

  return (
    <Alert variant={config.variant} className="mt-4">
      <config.icon className="h-4 w-4" />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>{config.description}</AlertDescription>
    </Alert>
  );
}