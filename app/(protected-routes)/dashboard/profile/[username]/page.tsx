import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AchievementBadge from "@/components/gamification/achievement-badge";
import MessageButton from "@/components/profile/message-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  MapPin,
  GraduationCap,
  Building2,
  Star,
  Trophy,
  Flame,
  Target,
  Award,
  UsersIcon,
} from "lucide-react";
import { UserProfile, UserAchievement, PointTransaction } from "@/lib/types";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

async function getUserProfile(username: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_profile_by_username", {
    username_param: username,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}

async function getCurrentUser(): Promise<{
  username: string | null;
  userId: string | null;
}> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { username: null, userId: null };
    }

    // Get the user's profile to get their username
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (profileError || !profiles) {
      return { username: null, userId: user.id };
    }

    return { username: profiles.username, userId: user.id };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { username: null, userId: null };
  }
}

async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_user_achievements", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }

  return data || [];
}

async function getUserStats(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_user_stats", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }

  return data;
}

async function getRecentPointHistory(
  userId: string
): Promise<PointTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_user_point_history", {
    p_user_id: userId,
    p_limit: 5,
  });

  if (error) {
    console.error("Error fetching point history:", error);
    return [];
  }

  return data || [];
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getUserProfile(params.username);

  if (!profile) {
    notFound();
  }

  // Get current user info to determine if this is their own profile
  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser.username === params.username;

  const [achievements, userStats, pointHistory] = await Promise.all([
    getUserAchievements(profile.id),
    getUserStats(profile.id),
    getRecentPointHistory(profile.id),
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getActivityIcon = (source: string) => {
    switch (source) {
      case "tutor_session":
        return "👨‍🏫";
      case "class_join":
        return "👥";
      case "quiz":
        return "🧠";
      case "study_session":
        return "📖";
      case "daily_challenge":
        return "🎯";
      case "achievement":
        return "🏆";
      default:
        return "⭐";
    }
  };
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Info */}
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profile.avatar_url || ""}
                  alt={profile.full_name || ""}
                />
                <AvatarFallback className="text-2xl">
                  {profile.full_name?.charAt(0) ||
                    profile.username?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      {profile.full_name}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      @{profile.username}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        250000 Friends
                      </div>

                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        Level {profile.level}
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {profile.total_points.toLocaleString()} points
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        {profile.current_streak} day streak
                      </div>
                    </div>
                  </div>

                  {/* Message Button - only show if not viewing own profile */}
                  {!isOwnProfile && currentUser.username && (
                    <div className="ml-4">
                      <MessageButton
                        currentUsername={currentUser.username}
                        targetUsername={params.username}
                        targetFullName={profile.full_name}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.bio && (
              <p className="text-muted-foreground">{profile.bio}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.university && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.university}</span>
                </div>
              )}
              {profile.year_of_study && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.year_of_study}</span>
                </div>
              )}
              {profile.major && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.major}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <CalendarDays className="h-4 w-4" />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="w-full md:w-1/3 space-y-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Stats Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Points
                </span>
                <span className="font-semibold">
                  {profile.total_points.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Level</span>
                <span className="font-semibold">{profile.level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Experience
                </span>
                <span className="font-semibold">
                  {profile.experience_points.toLocaleString()} XP
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Streak
                </span>
                <span className="font-semibold">
                  {profile.current_streak} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Best Streak
                </span>
                <span className="font-semibold">
                  {profile.longest_streak} days
                </span>
              </div>
              {userStats?.rank && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Leaderboard Rank
                  </span>
                  <span className="font-semibold">#{userStats.rank}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Achievements
                </span>
                <span className="font-semibold">{achievements.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements ({achievements.length})
            </CardTitle>
            <CardDescription>
              Badges earned through various activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.achievement_id}
                  achievement={achievement}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {pointHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest point transactions and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pointHistory.map((transaction) => (
                <div
                  key={transaction.transaction_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getActivityIcon(transaction.source)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {transaction.description ||
                          `${transaction.source.replace("_", " ")}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        transaction.transaction_type === "earned"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.transaction_type === "earned" ? "+" : "-"}
                      {transaction.points} pts
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {transaction.transaction_type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
