import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useSubscription() {
  const { toast } = useToast();

  const { data: subscriptionStatus, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { subscribed: false };

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

  const checkCanAddTool = async (currentToolCount: number) => {
    if (subscriptionStatus?.subscribed) return true;
    
    if (currentToolCount >= 5) {
      toast({
        title: "Free Plan Limit Reached",
        description: "Upgrade to Premium to add more tools",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  return {
    isSubscribed: subscriptionStatus?.subscribed ?? false,
    isLoading,
    checkCanAddTool,
  };
}