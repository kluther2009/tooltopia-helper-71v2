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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No session found');
          return { subscribed: false };
        }

        const response = await fetch('/functions/v1/check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Subscription check failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Subscription status:', data);
        return data;
      } catch (error) {
        console.error('Error checking subscription:', error);
        throw error;
      }
    },
  });

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to subscribe",
        });
        return;
      }

      console.log('Creating checkout session...');
      const response = await fetch('/functions/v1/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      // Store the response data in a variable first
      const responseData = await response.json().catch(async () => {
        // If JSON parsing fails, try to get the text
        const text = await response.text();
        throw new Error(text || 'Failed to parse response');
      });

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create checkout session');
      }

      const { url } = responseData;
      if (url) {
        console.log('Redirecting to checkout:', url);
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        variant: "destructive",
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to initiate subscription process",
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