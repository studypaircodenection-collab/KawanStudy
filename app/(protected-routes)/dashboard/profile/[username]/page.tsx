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
import ConnectionButton from "@/components/profile/connection-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  MapPin,
  GraduationCap,
  Building2,
  Star,
  Trophy,
  Target,
  Award,
  UsersIcon,
  ArrowRightIcon,
  BookOpen,
} from "lucide-react";
import { UserProfile, UserAchievement, PointTransaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import NoteCard from "@/components/notes/note-card";

// Custom interface for profile notes
interface ProfileNotesResponse {
  notes: Array<{
    id: string;
    title: string;
    description: string;
    subject: string;
    noteType: string;
    tags: string[];
    createdAt: string;
    estimatedReadTime: number;
    viewCount?: number;
    downloadCount?: number;
    likeCount?: number;
    thumbnailUrl?: string;
    academicLevel?: string;
    language?: string;
    difficultyLevel?: string;
    institution?: string;
    userProfile?: {
      id: string;
      username: string;
      fullName: string;
      avatarUrl: string;
    };
  }>;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
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

async function getUserConnections(userId: string): Promise<number> {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("peer_connections")
      .select("*", { count: "exact", head: true })
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted");

    if (error) {
      console.error("Error fetching connections count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error fetching connections count:", error);
    return 0;
  }
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

async function getUserNotes(userId: string): Promise<ProfileNotesResponse> {
  const supabase = await createClient();

  try {
    const { data: notes, error } = await supabase
      .from("notes")
      .select(
        `
        id,
        title,
        description,
        subject,
        note_type,
        tags,
        created_at,
        estimated_read_time,
        view_count,
        download_count,
        like_count,
        academic_level,
        language,
        difficulty_level,
        institution,
        file_url,
        user_id,
        profiles!notes_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "published")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error fetching user notes:", error);
      return {
        notes: [],
        total: 0,
        page: 1,
        limit: 3,
        hasMore: false,
      };
    }

    if (!notes || notes.length === 0) {
      return {
        notes: [],
        total: 0,
        page: 1,
        limit: 3,
        hasMore: false,
      };
    }

    // Transform the data to match our interface with proper type safety
    const transformedNotes = (notes || []).map((note: any) => {
      const noteCard = {
        id: note.id,
        title: note.title || "Untitled Note",
        description: note.description || "",
        subject: note.subject || "General",
        noteType:
          note.note_type
            ?.replace(/-/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Note",
        tags: Array.isArray(note.tags) ? note.tags : [],
        createdAt: note.created_at,
        estimatedReadTime: note.estimated_read_time || 5,
        viewCount: note.view_count || 0,
        downloadCount: note.download_count || 0,
        likeCount: note.like_count || 0,
        academicLevel: note.academic_level,
        language: note.language,
        difficultyLevel: note.difficulty_level,
        institution: note.institution,
        thumbnailUrl: note.file_url
          ? `${note.file_url}?thumbnail=true`
          : undefined,
        userProfile: note.profiles
          ? {
              id: note.profiles.id,
              username: note.profiles.username,
              fullName: note.profiles.full_name,
              avatarUrl: note.profiles.avatar_url || "",
            }
          : undefined,
      };
      return noteCard;
    });

    return {
      notes: transformedNotes,
      total: transformedNotes.length,
      page: 1,
      limit: 3,
      hasMore: transformedNotes.length === 3, // If we got 3 notes, there might be more
    };
  } catch (error) {
    console.error("Error fetching user notes:", error);
    return {
      notes: [],
      total: 0,
      page: 1,
      limit: 3,
      hasMore: false,
    };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getUserProfile(params.username);

  if (!profile) {
    notFound();
  }

  // Get current user info to determine if this is their own profile
  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser.username === params.username;

  const [achievements, userStats, pointHistory, connectionsCount, notesData] =
    await Promise.all([
      getUserAchievements(profile.id),
      getUserStats(profile.id),
      getRecentPointHistory(profile.id),
      getUserConnections(profile.id),
      getUserNotes(profile.id),
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
    <div className="container mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Info */}
        <div className={`w-full  ${isOwnProfile ? "lg:w-full" : "lg:w-full"}`}>
          <div className="relative">
            <div className="bg-secondary rounded-xl lg:aspect-5/1 aspect-3/1"></div>
            <div className="flex flex-col -translate-y-10  items-start gap-2">
              <div className="pl-4">
                <Avatar className="h-20 w-20 border-background border bg-background">
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
              </div>
              <div className="w-full flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">
                        {profile.full_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardDescription className="text-lg">
                          @{profile.username}
                        </CardDescription>
                        <Badge className="bg-amber-200 text-yellow-900">
                          <Star className="h-4 w-4" />
                          Level {profile.level}
                        </Badge>
                        <Badge className="bg-green-200 text-green-900">
                          <Trophy className="h-4 w-4" />
                          {profile.total_points.toLocaleString()} points
                        </Badge>
                        <Badge variant={"secondary"}>
                          <UsersIcon className="h-4 w-4" />
                          {connectionsCount}{" "}
                          {connectionsCount === 1 ? "Friend" : "Friends"}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons - only show if not viewing own profile */}
                  </div>
                </div>
                <div className="flex justify-end items-start gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
                  {!isOwnProfile && currentUser.username && (
                    <div className="flex gap-2">
                      <ConnectionButton
                        targetUserId={profile.id}
                        targetUsername={params.username}
                        targetFullName={profile.full_name}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {profile.bio && (
              <p className="text-muted-foreground">{profile.bio}</p>
            )}

            <div className="flex items-center justify-start flex-wrap gap-4 text-sm">
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

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {/* {isOwnProfile ? (
          <div className="w-full lg:w-1/3 space-y-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Stats Overview</CardTitle>
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
        ) : null} */}
      </div>

      {/* Achievements Section */}
      {achievements.length > 0 ? (
        <Card className="relative">
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
          <Button
            variant={"outline"}
            className="absolute top-6 right-6"
            asChild
          >
            <Link href={`/dashboard/profile/${profile.username}/achievement`}>
              View all Achievement
              <ArrowRightIcon size={4} />
            </Link>
          </Button>
        </Card>
      ) : (
        <Card className="relative">
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>

              {isOwnProfile ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">
                    Ready to Start Achieving?
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Complete your first study session, join a class, or help a
                    fellow student to unlock your first achievement badge!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl mb-2">📚</div>
                      <div className="font-medium">Study Sessions</div>
                      <div className="text-muted-foreground">
                        Complete focused study time
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl mb-2">🤝</div>
                      <div className="font-medium">Help Others</div>
                      <div className="text-muted-foreground">
                        Tutor fellow students
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="font-medium">Daily Goals</div>
                      <div className="text-muted-foreground">
                        Complete daily challenges
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">No Achievements Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {profile.full_name?.split(" ")[0] || profile.username} is
                    just getting started on their learning journey.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <Button
            variant={"outline"}
            className="absolute top-6 right-6"
            asChild
          >
            <Link href={`/dashboard/profile/${profile.username}/achievement`}>
              View all Achievement
              <ArrowRightIcon size={4} />
            </Link>
          </Button>
        </Card>
      )}

      {/* Notes */}

      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            📝 Notes by{" "}
            {isOwnProfile ? "you" : profile.username || profile.full_name}
          </CardTitle>
          <CardDescription>
            {notesData.notes.length === 0
              ? isOwnProfile
                ? "You haven't uploaded any notes yet."
                : `${
                    profile.username || profile.full_name
                  } hasn't uploaded any notes yet.`
              : isOwnProfile
              ? `You have uploaded notes on various subjects`
              : `Latest notes shared by ${
                  profile.username || profile.full_name
                }`}
          </CardDescription>
        </div>
        {notesData.hasMore && (
          <Button variant="outline" asChild>
            <Link href={`/dashboard/notes?author=${profile.username}`}>
              View All Notes
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {notesData.notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {notesData.notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          {isOwnProfile ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Ready to Share Your Knowledge?
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload your first note to help fellow students learn and earn
                points!
              </p>
              <Button asChild>
                <Link href="/dashboard/notes/upload">
                  Upload Your First Note
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">No Notes Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {profile.full_name?.split(" ")[0] || profile.username} hasn't
                shared any notes yet.
              </p>
            </div>
          )}
        </div>
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
