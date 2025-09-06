import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { dispatchPointsUpdate } from "@/lib/utils/points-events";

interface DailyClaim {
  canClaim: boolean;
  isLoading: boolean;
  isClaiming: boolean;
  claimPoints: () => Promise<void>;
}

export function useDailyClaim(): DailyClaim {
  const [canClaim, setCanClaim] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  // Check if user can claim points today
  useEffect(() => {
    checkClaimStatus();
  }, []);

  const checkClaimStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has already claimed today by looking at local storage
      const today = new Date().toISOString().split('T')[0];
      const lastClaim = localStorage.getItem('lastDailyClaim');
      
      if (lastClaim === today) {
        setCanClaim(false);
      } else {
        setCanClaim(true);
      }
    } catch (error) {
      console.error('Error checking claim status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const claimPoints = async () => {
    if (isClaiming || !canClaim) return;

    try {
      setIsClaiming(true);

      const response = await fetch('/api/daily-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "Daily points already claimed today") {
          setCanClaim(false);
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem('lastDailyClaim', today);
          toast({
            title: "Already Claimed",
            description: "You've already claimed your daily points today!",
            variant: "destructive",
          });
        } else {
          throw new Error(result.error);
        }
        return;
      }

      // Success
      setCanClaim(false);
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('lastDailyClaim', today);

      // Dispatch custom event for real-time UI updates
      if (result.pointsAwarded) {
        dispatchPointsUpdate({
          pointsAwarded: result.pointsAwarded,
          source: 'daily_claim'
        });
      }

      toast({
        title: "🎉 Daily Points Claimed!",
        description: `${result.message} Come back tomorrow for more points!`,
      });

    } catch (error) {
      console.error('Error claiming daily points:', error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim daily points. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return {
    canClaim,
    isLoading,
    isClaiming,
    claimPoints,
  };
}
