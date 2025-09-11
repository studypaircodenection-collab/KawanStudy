"use client";

import React from "react";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AchievementBadge from "@/components/gamification/achievement-badge";
import ConnectionButton from "@/components/profile/connection-button";
import { CustomizedAvatar } from "@/components/ui/customized-avatar";
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
  Linkedin,
  Github,
  Instagram,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import NoteCard from "@/components/notes/note-card";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/constant";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

function ProfilePageContent({ username }: { username: string }) {
  const { data, loading, error } = useProfile(username);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    notFound();
  }

  const {
    profile,
    currentUser,
    achievements,
    connectionsCount,
    pointHistory,
    notes,
  } = data;
  const isOwnProfile = currentUser.username === username;

 

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
            <div
              className={`rounded-xl aspect-4/1 bg-cover bg-center bg-no-repeat ${
                profile.header_image_url ? " " : "bg-card"
              }`}
              style={{
                backgroundImage: profile.header_image_url
                  ? `url(${profile.header_image_url})`
                  : undefined,
              }}
            >
              {!profile.header_image_url && (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">no header yet....</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col -translate-y-10  items-start gap-2">
              <div className="pl-4">
                <CustomizedAvatar
                  userId={profile.id}
                  src={profile.avatar_url || ""}
                  fallback={
                    profile.full_name?.charAt(0) ||
                    profile.username?.charAt(0) ||
                    "U"
                  }
                  size="xl"
                  showBadges={true}
                  showTitle={true}
                  className="h-20 w-20 bg-background rounded-full"
                />
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
                  </div>
                </div>
                <div className="flex justify-end items-start gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
                  {!isOwnProfile && currentUser.username && (
                    <div className="flex gap-2">
                      <ConnectionButton
                        targetUserId={profile.id}
                        targetUsername={username}
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

            {/* Social Media Links */}
            {(profile.linkedin_url ||
              profile.github_url ||
              profile.instagram_url ||
              profile.tiktok_url ||
              profile.website_url) && (
              <div className="flex items-center gap-3 flex-wrap">
                {profile.linkedin_url && (
                  <Link
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="text-sm">{profile.linkedin_url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                {profile.github_url && (
                  <Link
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gray-800 hover:text-gray-600 transition-colors"
                    title="GitHub Profile"
                  >
                    <Github className="h-5 w-5" />
                    <span className="text-sm">{profile.github_url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                {profile.instagram_url && (
                  <Link
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-600 hover:text-pink-800 transition-colors"
                    title="Instagram Profile"
                  >
                    <Instagram className="h-5 w-5" />
                    <span className="text-sm">{profile.instagram_url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                {profile.tiktok_url && (
                  <Link
                    href={profile.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-black hover:text-gray-700 transition-colors"
                    title="TikTok Profile"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-sm">{profile.tiktok_url}</span>{" "}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                {profile.website_url && (
                  <Link
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    title="Personal Website"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-sm">{profile.website_url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
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
                  achievement={achievement as any}
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
      ) : null}

      {/* Notes */}
      <div className="flex items-center justify-between">
        <div className="flex justify-between items-center gap-2 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              📝 Notes by{" "}
              {isOwnProfile ? "you" : profile.username || profile.full_name}
            </CardTitle>
            <CardDescription>
              {notes.notes.length === 0
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
          <div>
            {notes.hasMore && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/notes/browse/${profile.username}`}>
                  View All Notes
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {notes.notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {notes.notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
            />
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
        <>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest point transactions and activities
          </CardDescription>

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
        </>
      )}
    </div>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return <ProfilePageContent username={username} />;
}
