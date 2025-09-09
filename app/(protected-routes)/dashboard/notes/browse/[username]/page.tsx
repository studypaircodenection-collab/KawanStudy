import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Calendar,
  Eye,
  Heart,
  Download,
  MapPin,
  GraduationCap,
  Star,
  FileText,
  TrendingUp,
} from "lucide-react";
import NoteCard from "@/components/notes/note-card";
import { notFound } from "next/navigation";

interface UserNote {
  id: string;
  title: string;
  description: string;
  subject: string;
  noteType: string;
  tags: string[];
  createdAt: string;
  estimatedReadTime: number;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  academicLevel: string;
  language: string;
  difficultyLevel: string;
  institution: string;
  status: string;
  visibility: string;
  thumbnailUrl?: string;
  userProfile?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  institution: string;
  academicLevel: string;
  major: string;
  location: string;
  joinedAt: string;
  totalNotes: number;
  totalViews: number;
  totalLikes: number;
  totalDownloads: number;
  isVerified: boolean;
}

interface UserNotesStats {
  totalPublicNotes: number;
  totalViews: number;
  totalLikes: number;
  totalDownloads: number;
  mostPopularSubject: string;
  averageRating: number;
}

async function getUserByUsername(
  username: string
): Promise<UserProfile | null> {
  const supabase = await createClient();

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        username,
        full_name,
        avatar_url,
        bio,
        university,
        year_of_study,
        major,
        location,
        created_at
      `
      )
      .eq("username", username)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      username: profile.username,
      fullName: profile.full_name || "",
      avatarUrl: profile.avatar_url || "",
      bio: profile.bio || "",
      institution: profile.university || "",
      academicLevel: profile.year_of_study || "",
      major: profile.major || "",
      location: profile.location || "",
      joinedAt: profile.created_at,
      totalNotes: 0, // Will be calculated separately
      totalViews: 0, // Will be calculated separately
      totalLikes: 0, // Will be calculated separately
      totalDownloads: 0, // Will be calculated separately
      isVerified: false, // Not available in current schema
    };
  } catch (error) {
    console.error("Exception in getUserByUsername:", error);
    return null;
  }
}

async function getUserNotes(
  userId: string
): Promise<{ notes: UserNote[]; stats: UserNotesStats }> {
  const supabase = await createClient();

  try {
    const { data: notesData, error } = await supabase
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
        status,
        visibility,
        file_url,
        profiles!notes_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("user_id", userId)
      .eq("visibility", "public") // Only show public notes
      .eq("status", "published") // Only show published notes
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user notes:", error);
      return {
        notes: [],
        stats: {
          totalPublicNotes: 0,
          totalViews: 0,
          totalLikes: 0,
          totalDownloads: 0,
          mostPopularSubject: "",
          averageRating: 0,
        },
      };
    }

    // Transform notes data
    const transformedNotes = (notesData || []).map((note: any) => ({
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
      status: note.status,
      visibility: note.visibility,
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
    }));

    // Calculate stats
    const totalViews = transformedNotes.reduce(
      (sum: number, note: UserNote) => sum + note.viewCount,
      0
    );
    const totalLikes = transformedNotes.reduce(
      (sum: number, note: UserNote) => sum + note.likeCount,
      0
    );
    const totalDownloads = transformedNotes.reduce(
      (sum: number, note: UserNote) => sum + note.downloadCount,
      0
    );

    // Find most popular subject
    const subjectCounts = transformedNotes.reduce(
      (acc: Record<string, number>, note: UserNote) => {
        acc[note.subject] = (acc[note.subject] || 0) + 1;
        return acc;
      },
      {}
    );

    const mostPopularSubject =
      Object.entries(subjectCounts).reduce(
        (a, b) => (subjectCounts[a[0]] > subjectCounts[b[0]] ? a : b),
        ["", 0]
      )[0] || "";

    const stats: UserNotesStats = {
      totalPublicNotes: transformedNotes.length,
      totalViews,
      totalLikes,
      totalDownloads,
      mostPopularSubject,
      averageRating:
        totalLikes > 0
          ? Number((totalLikes / transformedNotes.length).toFixed(1))
          : 0,
    };

    return { notes: transformedNotes, stats };
  } catch (error) {
    console.error("Exception in getUserNotes:", error);
    return {
      notes: [],
      stats: {
        totalPublicNotes: 0,
        totalViews: 0,
        totalLikes: 0,
        totalDownloads: 0,
        mostPopularSubject: "",
        averageRating: 0,
      },
    };
  }
}

export default async function UserNotesPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  try {
    const { username } = await params;

    console.log("Looking for user:", username);

    // Get user profile
    const userProfile = await getUserByUsername(username);

    if (!userProfile) {
      console.log("User profile not found for username:", username);
      notFound();
    }

    console.log("Found user profile:", userProfile.username);

    // Get user's notes and stats
    const { notes, stats } = await getUserNotes(userProfile.id);

    console.log("Found notes for user:", notes.length);

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div className="container mx-auto space-y-6">
        {/* User Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage
                    src={userProfile.avatarUrl}
                    alt={userProfile.fullName}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(userProfile.fullName || userProfile.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">
                    {userProfile.fullName || userProfile.username}
                  </h1>
                  {userProfile.isVerified && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">
                  @{userProfile.username}
                </p>

                {/* Quick Stats */}
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">
                      {stats.totalPublicNotes}
                    </div>
                    <div className="text-muted-foreground">Notes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{stats.totalViews}</div>
                    <div className="text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{stats.totalLikes}</div>
                    <div className="text-muted-foreground">Likes</div>
                  </div>
                </div>
              </div>

              {/* Detailed Info */}
              <div className="flex-1 space-y-4">
                {userProfile.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{userProfile.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProfile.institution && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{userProfile.institution}</span>
                    </div>
                  )}

                  {userProfile.academicLevel && (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{userProfile.academicLevel}</span>
                    </div>
                  )}

                  {userProfile.major && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{userProfile.major}</span>
                    </div>
                  )}

                  {userProfile.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {formatDate(userProfile.joinedAt)}</span>
                  </div>

                  {stats.mostPopularSubject && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>Popular in {stats.mostPopularSubject}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Public Notes
                  </p>
                  <p className="text-2xl font-bold">{stats.totalPublicNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Likes
                  </p>
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Downloads
                  </p>
                  <p className="text-2xl font-bold">{stats.totalDownloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {userProfile.fullName || userProfile.username}&apos;s Notes
            </h2>
            <p className="text-muted-foreground">
              {stats.totalPublicNotes} public notes available
            </p>
          </div>
        </div>

        {/* Notes Grid */}
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                isOwnNote={
                  (note.userProfile?.id || " ") === userProfile.id || false
                }
                key={note.id}
                note={note}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No public notes yet
              </h3>
              <p className="text-muted-foreground">
                {userProfile.fullName || userProfile.username} hasn&apos;t
                shared any public notes yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in UserNotesPage:", error);
    notFound();
  }
}
