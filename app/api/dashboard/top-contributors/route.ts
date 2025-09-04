import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // Get top contributors based on note count and engagement
    const { data: contributors, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        username,
        full_name,
        avatar_url,
        notes!inner(
          id,
          like_count,
          download_count,
          view_count
        )
      `
      )
      .limit(limit);

    if (error) {
      console.error("Error fetching contributors:", error);
      return NextResponse.json([]);
    }

    // Calculate stats for each contributor
    const topContributors = (contributors || [])
      .map((profile) => {
        const noteCount = profile.notes?.length || 0;
        const totalLikes =
          profile.notes?.reduce(
            (sum, note) => sum + (note.like_count || 0),
            0
          ) || 0;
        const totalDownloads =
          profile.notes?.reduce(
            (sum, note) => sum + (note.download_count || 0),
            0
          ) || 0;
        const totalViews =
          profile.notes?.reduce(
            (sum, note) => sum + (note.view_count || 0),
            0
          ) || 0;

        return {
          id: profile.id,
          username: profile.username,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          noteCount,
          totalLikes,
          totalDownloads,
          totalViews,
          score:
            noteCount * 10 + totalLikes * 2 + totalDownloads + totalViews * 0.1,
        };
      })
      .filter((contributor) => contributor.noteCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json(topContributors);
  } catch (error) {
    console.error("Top contributors API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
