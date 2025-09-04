import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get basic stats
    const [notesResult, usersResult, downloadsResult] = await Promise.all([
      // Total published notes
      supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("visibility", "public"),

      // Active users (users with notes)
      supabase.from("profiles").select("*", { count: "exact", head: true }),

      // Total downloads approximation (sum of download counts)
      supabase
        .from("notes")
        .select("download_count")
        .eq("status", "published")
        .eq("visibility", "public"),
    ]);

    // Calculate total downloads
    const totalDownloads =
      downloadsResult.data?.reduce(
        (sum, note) => sum + (note.download_count || 0),
        0
      ) || 0;

    // Get unique subjects count
    const { data: subjectsData } = await supabase
      .from("notes")
      .select("subject")
      .eq("status", "published")
      .eq("visibility", "public");

    const uniqueSubjects = new Set(subjectsData?.map((note) => note.subject))
      .size;

    const stats = {
      total_notes: notesResult.count || 0,
      active_users: usersResult.count || 0,
      total_downloads: totalDownloads,
      total_subjects: uniqueSubjects || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        total_notes: 0,
        active_users: 0,
        total_downloads: 0,
        total_subjects: 0,
      },
      { status: 500 }
    );
  }
}
