"use client";

import React from "react";
import { useGamification } from "@/hooks/use-gamification";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Target, Users } from "lucide-react";
import AchievementBadge from "./achievement-badge";
import Leaderboard from "./leaderboard";
import { LeaderboardEntry } from "@/lib/types";
import Link from "next/link";
interface GamificationDashboardProps {
  userId?: string;
}

export function GamificationDashboard({ userId }: GamificationDashboardProps) {
  const {
    userStats,
    leaderboard,
    achievements,
    dailyChallenges,

    statsLoading,
    leaderboardLoading,
    challengesLoading,
    logActivity,
    completeChallenge,
  } = useGamification(userId);

  const handleCompleteChallenge = async (challengeId: string) => {
    const success = await completeChallenge(challengeId);
    if (success) {
      // Could show a toast notification here
      console.log("Challenge completed!");
    }
  };

  const simulateActivity = async (activityType: string, points: number) => {
    await logActivity(activityType, { simulation: true }, points);
  };

  if (statsLoading && !userStats) {
    return <div className="p-4">Loading gamification data...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {/* User Stats Overview */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Points
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.profile.total_points.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Rank #{userStats.rank || "Unranked"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.profile.level}
              </div>
              <p className="text-xs text-muted-foreground">
                {userStats.profile.experience_points} XP
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Achievements
              </CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.achievements_count}
              </div>
              <p className="text-xs text-muted-foreground">
                Challenges today: {userStats.daily_challenges_completed_today}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Challenges
            </CardTitle>
            <CardDescription>
              Complete challenges to earn points and maintain your streak
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {challengesLoading ? (
              <div>Loading challenges...</div>
            ) : (
              dailyChallenges.slice(0, 5).map((challenge) => (
                <div key={challenge.challenge_id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {challenge.challenge_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {challenge.challenge_description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          challenge.difficulty === "easy"
                            ? "secondary"
                            : challenge.difficulty === "medium"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {challenge.difficulty}
                      </Badge>
                      <span className="text-sm font-medium">
                        +{challenge.points_reward}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={challenge.progress_percentage}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">
                      {challenge.current_progress}/{challenge.target_value}
                    </span>
                  </div>
                  {!challenge.is_completed && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleCompleteChallenge(challenge.challenge_id)
                      }
                      disabled={challenge.is_completed}
                    >
                      Complete Step
                    </Button>
                  )}
                  {challenge.is_completed && (
                    <Badge variant="outline" className="text-green-600">
                      ✓ Completed
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leaderboard
              </div>
              <Button variant={"ghost"}>
                <Link href="/dashboard/leaderboard">View Full Leaderboard</Link>
              </Button>
            </CardTitle>
            <CardDescription>Top students by total points</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
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
            ) : (
              <Leaderboard
                entries={leaderboard as LeaderboardEntry[]}
                showTop={3}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.slice(0, 6).map((achievement) => (
                <AchievementBadge
                  key={achievement.achievement_id}
                  achievement={achievement}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing/Demo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Actions</CardTitle>
          <CardDescription>
            Test the gamification system (development only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => simulateActivity("tutor_session", 50)}
            >
              Simulate Tutor Session (+50)
            </Button>
            <Button
              size="sm"
              onClick={() => simulateActivity("class_join", 25)}
            >
              Join Class (+25)
            </Button>
            <Button size="sm" onClick={() => simulateActivity("quiz", 15)}>
              Complete Quiz (+15)
            </Button>
            <Button
              size="sm"
              onClick={() => simulateActivity("study_session", 10)}
            >
              Study Session (+10)
            </Button>
            <Button 
              size="sm" 
              onClick={() => simulateActivity("profile_update", 0)}
              variant="outline"
            >
              Profile Update Activity
            </Button>
            <Button 
              size="sm" 
              onClick={() => simulateActivity("quiz_completed", 0)}
              variant="outline"
            >
              Quiz Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
