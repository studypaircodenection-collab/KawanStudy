import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardEntry } from "@/lib/types";
import Leaderboard from "@/components/gamification/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, TrendingUp } from "lucide-react";

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

function LeaderboardStats({ entries }: { entries: LeaderboardEntry[] }) {
  const totalUsers = entries.length;
  const topUser = entries[0];
  const averagePoints =
    entries.length > 0
      ? Math.round(
          entries.reduce((sum, entry) => sum + entry.total_points, 0) /
            entries.length
        )
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Participants
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Active users on leaderboard
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topUser?.total_points.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {topUser?.full_name || topUser?.username || "No leader yet"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Points</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {averagePoints.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Across all participants
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3 animate-pulse mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

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
      <LeaderboardStats entries={entries} />

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
