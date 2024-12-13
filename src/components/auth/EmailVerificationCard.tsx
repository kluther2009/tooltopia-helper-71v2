import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationStatus } from "@/components/VerificationStatus";

interface EmailVerificationCardProps {
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export function EmailVerificationCard({ status, message }: EmailVerificationCardProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4 sm:px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-card-foreground">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VerificationStatus status={status} message={message} />
        </CardContent>
      </Card>
    </div>
  );
}