import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Star,
  Flame,
  Award,
  Lock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  Zap,
} from "lucide-react";
import { UserProfile } from "@/lib/types";

interface AchievementPageProps {
  params: {
    username: string;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement_value: number;
  requirement_type: string;
  is_earned?: boolean;
  earned_at?: string;
  progress?: number;
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

async function getAllAchievementsWithProgress(
  userId: string
): Promise<Achievement[]> {
  const supabase = await createClient();

  // Get all achievements with user progress
  const { data, error } = await supabase.rpc("get_achievements_with_progress", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching achievements with progress:", error);
    return [];
  }

  return data || [];
}

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const isEarned = achievement.is_earned;
  const progress = achievement.progress || 0;
  const progressPercentage = Math.min(
    (progress / achievement.requirement_value) * 100,
    100
  );

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "study":
        return <BookOpen className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      case "streak":
        return <Flame className="h-4 w-4" />;
      case "points":
        return <Star className="h-4 w-4" />;
      case "tutoring":
        return <Award className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <Card
      className={`relative ${
        isEarned
          ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
          : "opacity-75"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`text-2xl ${isEarned ? "" : "grayscale opacity-50"}`}
            >
              {achievement.icon}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {achievement.title}
                {isEarned ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-400" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {getCategoryIcon(achievement.category)}
                  <span className="ml-1">{achievement.category}</span>
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {achievement.points} pts
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {achievement.description}
        </p>

        {!isEarned && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {progress} / {achievement.requirement_value}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {isEarned && achievement.earned_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t">
            <Calendar className="h-4 w-4" />
            <span>
              Earned on{" "}
              {new Date(achievement.earned_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default async function AchievementPage({
  params,
}: AchievementPageProps) {
  const { username } = await params;
  const profile = await getUserProfile(username);

  if (!profile) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser.username === username;

  const [achievements] = await Promise.all([
    getAllAchievementsWithProgress(profile.id),
  ]);

  const earnedAchievements = achievements.filter((a) => a.is_earned);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={profile.avatar_url || ""}
            alt={profile.full_name || ""}
          />
          <AvatarFallback className="text-xl">
            {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {isOwnProfile
              ? "Your Achievements"
              : `${profile.full_name}'s Achievements`}
          </h1>
          <p className="text-muted-foreground">
            {earnedAchievements.length} of {achievements.length} achievements
            unlocked
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
