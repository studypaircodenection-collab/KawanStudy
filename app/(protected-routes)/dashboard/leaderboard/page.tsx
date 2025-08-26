import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardEntry } from "@/lib/types";
import Leaderboard from "@/components/gamification/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("get_leaderboard");

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}
function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Leaderboard Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border rounded-lg animate-pulse"
              >
                <div className="h-5 w-5 bg-muted rounded-full"></div>
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded w-12"></div>
                  <div className="h-3 bg-muted rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function LeaderboardContent() {
  const entries = await getLeaderboardData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Full Leaderboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{entries.length} participants</Badge>
            <p className="text-sm text-muted-foreground">
              Rankings updated in real-time
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Leaderboard entries={entries} showTop={50} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other students in the StudyPair community
        </p>
      </div>

      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardContent />
      </Suspense>
    </div>
  );
}
