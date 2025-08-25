import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const test = searchParams.get("test");

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (test) {
      case "profiles":
        return await testProfiles(supabase);
      case "leaderboard-view":
        return await testLeaderboardView(supabase);
      case "leaderboard-function":
        return await testLeaderboardFunction(supabase);
      case "gamification-columns":
        return await testGamificationColumns(supabase);
      default:
        return NextResponse.json({
          message: "Gamification Debug API",
          availableTests: [
            "profiles",
            "leaderboard-view",
            "leaderboard-function",
            "gamification-columns",
          ],
        });
    }
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function testProfiles(supabase: any) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, total_points, level, current_streak")
    .limit(5);

  return NextResponse.json({
    test: "profiles",
    success: !error,
    error: error?.message,
    data: data || [],
  });
}

async function testLeaderboardView(supabase: any) {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(5);

  return NextResponse.json({
    test: "leaderboard-view",
    success: !error,
    error: error?.message,
    data: data || [],
  });
}

async function testLeaderboardFunction(supabase: any) {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_limit: 5,
  });

  return NextResponse.json({
    test: "leaderboard-function",
    success: !error,
    error: error?.message,
    data: data || [],
  });
}

async function testGamificationColumns(supabase: any) {
  const { data, error } = await supabase.rpc("check_gamification_setup");

  return NextResponse.json({
    test: "gamification-columns",
    success: !error,
    error: error?.message,
    data: data || [],
  });
}
