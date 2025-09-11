import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const supabase = await createClient();

    // Get user profile
    const { data: profileData, error: profileError } = await supabase.rpc(
      "get_profile_by_username",
      {
        username_param: username,
      }
    );

    if (profileError || !profileData || profileData.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = profileData[0];

    // Get current user info
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    let currentUserProfile = null;
    if (user) {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      currentUserProfile = currentProfile;
    }

    // Get user achievements
    const { data: achievements, error: achievementsError } = await supabase.rpc(
      "get_user_achievements",
      {
        p_user_id: profile.id,
      }
    );

    // Transform achievements to match the expected interface
    const transformedAchievements = (achievements || []).map(
      (achievement: any) => ({
        achievement_id: achievement.achievement_id,
        achievement_name: achievement.title || achievement.achievement_name,
        achievement_title: achievement.title || achievement.achievement_title,
        achievement_description:
          achievement.description || achievement.achievement_description,
        achievement_icon: achievement.icon || achievement.achievement_icon,
        rarity: achievement.badge_color || achievement.rarity || "common",
        earned_at: achievement.earned_at,
      })
    );

    // Get connections count
    const { count: connectionsCount, error: connectionsError } = await supabase
      .from("peer_connections")
      .select("*", { count: "exact", head: true })
      .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)
      .eq("status", "accepted");

    // Get recent point history
    const { data: pointHistory, error: pointHistoryError } = await supabase.rpc(
      "get_user_point_history",
      {
        p_user_id: profile.id,
        p_limit: 5,
      }
    );

    // Get user notes
    const { data: notes, error: notesError } = await supabase
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
        thumbnail_url,
        user_id,
        profiles!notes_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("user_id", profile.id)
      .eq("status", "published")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(3);

    // Transform notes data
    const transformedNotes = (notes || []).map((note: any) => ({
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
      thumbnailUrl:
        note.thumbnail_url ||
        (note.file_url ? `${note.file_url}?thumbnail=true` : undefined),
      userProfile: note.profiles
        ? {
            id: note.profiles.id,
            username: note.profiles.username,
            fullName: note.profiles.full_name,
            avatarUrl: note.profiles.avatar_url || "",
          }
        : undefined,
    }));

    return NextResponse.json({
      profile,
      currentUser: {
        username: currentUserProfile?.username || null,
        userId: user?.id || null,
      },
      achievements: transformedAchievements,
      connectionsCount: connectionsCount || 0,
      pointHistory: pointHistory || [],
      notes: {
        notes: transformedNotes,
        total: transformedNotes.length,
        page: 1,
        limit: 3,
        hasMore: transformedNotes.length === 3,
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
