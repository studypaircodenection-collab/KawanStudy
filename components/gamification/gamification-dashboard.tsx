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
import { Trophy, Flame, Star, Target, History, Users } from "lucide-react";

interface GamificationDashboardProps {
  userId?: string;
}

export function GamificationDashboard({ userId }: GamificationDashboardProps) {
  const {
    userStats,
    leaderboard,
    achievements,
    dailyChallenges,
    pointHistory,
    statsLoading,
    leaderboardLoading,
    achievementsLoading,
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
                Current Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.profile.current_streak}
              </div>
              <p className="text-xs text-muted-foreground">
                Best: {userStats.profile.longest_streak} days
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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leaderboard
            </CardTitle>
            <CardDescription>Top students by total points</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div>Loading leaderboard...</div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div key={entry.user_id} className="flex items-center gap-3">
                    <div className="font-bold text-lg w-8">#{entry.rank}</div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {entry.full_name || entry.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Level {entry.level} •{" "}
                        {entry.total_points.toLocaleString()} pts
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {entry.achievement_count} achievements
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.current_streak} day streak
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                <div
                  key={achievement.achievement_id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="text-2xl">{achievement.achievement_icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {achievement.achievement_title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.achievement_description}
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {achievement.rarity}
                    </Badge>
                  </div>
                </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
