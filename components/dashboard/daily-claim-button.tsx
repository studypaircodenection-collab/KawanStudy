import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift, Loader2 } from "lucide-react";
import { useDailyClaim } from "@/hooks/use-daily-claim";

export function DailyClaimButton() {
  const { canClaim, isLoading, isClaiming, claimPoints } = useDailyClaim();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Daily Bonus
          </CardTitle>
          <CardDescription>Loading claim status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Daily Bonus
        </CardTitle>
        <CardDescription>
          {canClaim
            ? "Claim your free 50 points for today!"
            : "Come back tomorrow for more points!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={claimPoints}
          disabled={!canClaim || isClaiming}
          className="w-full"
          size="lg"
        >
          {isClaiming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Claiming...
            </>
          ) : canClaim ? (
            <>
              <Gift className="mr-2 h-4 w-4" />
              Claim 50 Points
            </>
          ) : (
            "Already Claimed Today"
          )}
        </Button>

        {!canClaim && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            Next claim available tomorrow
          </p>
        )}
      </CardContent>
    </Card>
  );
}
