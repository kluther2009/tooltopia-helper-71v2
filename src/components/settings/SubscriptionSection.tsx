import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SubscriptionSection() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: subscriptionStatus, isLoading: isCheckingSubscription } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('/functions/v1/check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check subscription');
      }

      return response.json();
    },
  });

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please log in to subscribe",
        });
        return;
      }

      const response = await fetch('/functions/v1/create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate subscription process",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCheckingSubscription ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Current Plan</h3>
              <p className="text-muted-foreground">
                {subscriptionStatus?.subscribed ? "Premium Plan" : "Free Plan"}
              </p>
            </div>
            {!subscriptionStatus?.subscribed && (
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upgrade to Premium"
                )}
              </Button>
            )}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Plan Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Free Plan: Limited to 5 tools</li>
                <li>Premium Plan: Unlimited tools and features</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}