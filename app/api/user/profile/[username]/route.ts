import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const supabase = await createClient();
    const { username } = params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Get user profile by username
    const { data: profile, error: profileError } = await supabase.rpc(
      "get_profile_by_username",
      { username_param: username }
    );

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    if (!profile || profile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get user achievements
    const { data: achievements, error: achievementsError } = await supabase.rpc(
      "get_user_achievements",
      { p_user_id: profile[0].id }
    );

    if (achievementsError) {
      console.error("Achievements fetch error:", achievementsError);
    }

    // Get user stats
    const { data: userStats, error: statsError } = await supabase.rpc(
      "get_user_stats",
      { p_user_id: profile[0].id }
    );

    if (statsError) {
      console.error("Stats fetch error:", statsError);
    }

    // Get recent point history
    const { data: pointHistory, error: historyError } = await supabase.rpc(
      "get_user_point_history",
      { p_user_id: profile[0].id, p_limit: 10 }
    );

    if (historyError) {
      console.error("Point history fetch error:", historyError);
    }

    return NextResponse.json({
      profile: profile[0],
      achievements: achievements || [],
      userStats: userStats || null,
      pointHistory: pointHistory || [],
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
