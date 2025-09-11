import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get("search") || "";
    const subject = searchParams.get("subject");
    const academicLevel = searchParams.get("academicLevel");
    const noteType = searchParams.get("noteType");
    const language = searchParams.get("language");
    const difficulty = searchParams.get("difficulty");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortDirection = searchParams.get("sortDirection") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // First, get the user's profile to get their ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build the query for user's notes
    let query = supabase
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
        thumbnail_url,
        user_id,
        profiles!notes_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", profile.id)
      .eq("status", "published")
      .eq("visibility", "public");

    // Apply filters
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%`
      );
    }

    if (subject) {
      query = query.eq("subject", subject);
    }

    if (academicLevel) {
      query = query.eq(
        "academic_level",
        academicLevel.toLowerCase().replace(/\s+/g, "-")
      );
    }

    if (noteType) {
      query = query.eq(
        "note_type",
        noteType.toLowerCase().replace(/\s+/g, "-")
      );
    }

    if (language) {
      query = query.eq("language", language.toLowerCase().replace(/\s+/g, "-"));
    }

    if (difficulty) {
      query = query.eq("difficulty_level", difficulty.toLowerCase());
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: notes, error: notesError, count } = await query;

    if (notesError) {
      console.error("Error fetching user notes:", notesError);
      return NextResponse.json(
        { error: "Failed to fetch notes" },
        { status: 500 }
      );
    }

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
      status: note.status,
      visibility: note.visibility,
      thumbnailUrl: note.thumbnail_url || undefined,
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
      (sum: number, note: any) => sum + note.viewCount,
      0
    );
    const totalLikes = transformedNotes.reduce(
      (sum: number, note: any) => sum + note.likeCount,
      0
    );
    const totalDownloads = transformedNotes.reduce(
      (sum: number, note: any) => sum + note.downloadCount,
      0
    );

    // Find most popular subject
    const subjectCounts = transformedNotes.reduce(
      (acc: Record<string, number>, note: any) => {
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

    const stats = {
      totalPublicNotes: count || 0,
      totalViews,
      totalLikes,
      totalDownloads,
      mostPopularSubject,
      averageRating:
        totalLikes > 0
          ? Number((totalLikes / transformedNotes.length).toFixed(1))
          : 0,
    };

    return NextResponse.json({
      notes: transformedNotes,
      stats,
      userProfile: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
      },
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit,
    });
  } catch (error) {
    console.error("User notes API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
