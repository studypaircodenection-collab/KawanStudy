import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If userId is provided, use it; otherwise use current user
    const targetUserId = userId || user.id;

    switch (action) {
      case "stats":
        return await getUserStats(supabase, targetUserId);
      case "leaderboard":
        return await getLeaderboard(supabase, searchParams);
      case "achievements":
        return await getUserAchievements(supabase, targetUserId);
      case "daily-challenges":
        return await getDailyChallenges(supabase, targetUserId);
      case "point-history":
        return await getPointHistory(supabase, targetUserId, searchParams);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Gamification API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { action, ...data } = body;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (action) {
      case "log-activity":
        return await logActivity(supabase, user.id, data);
      case "complete-challenge":
        return await completeChallenge(supabase, user.id, data);
      case "add-points":
        return await addPoints(supabase, user.id, data);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Gamification API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserStats(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("get_user_stats", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error getting user stats:", error);
    return NextResponse.json(
      { error: "Failed to get user stats" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

async function getLeaderboard(supabase: any, searchParams: URLSearchParams) {
  const limit = parseInt(searchParams.get("limit") || "10");

  console.log("Attempting to get leaderboard with limit:", limit);

  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_limit: limit,
  });

  if (error) {
    console.error("Error getting leaderboard:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to get leaderboard", details: error.message },
      { status: 500 }
    );
  }

  console.log("Leaderboard data retrieved:", data);
  return NextResponse.json({ data });
}

async function getUserAchievements(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("get_user_achievements", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error getting user achievements:", error);
    return NextResponse.json(
      { error: "Failed to get achievements" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

async function getDailyChallenges(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("get_user_daily_challenges", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error getting daily challenges:", error);
    return NextResponse.json(
      { error: "Failed to get daily challenges" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

async function getPointHistory(
  supabase: any,
  userId: string,
  searchParams: URLSearchParams
) {
  const limit = parseInt(searchParams.get("limit") || "20");

  const { data, error } = await supabase.rpc("get_user_point_history", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    console.error("Error getting point history:", error);
    return NextResponse.json(
      { error: "Failed to get point history" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

async function logActivity(supabase: any, userId: string, data: any) {
  const { activityType, activityData = {}, pointsEarned = 0 } = data;

  const { error } = await supabase.rpc("log_user_activity", {
    p_user_id: userId,
    p_activity_type: activityType,
    p_activity_data: activityData,
    p_points_earned: pointsEarned,
  });

  if (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

async function completeChallenge(supabase: any, userId: string, data: any) {
  const { challengeId } = data;

  const { data: result, error } = await supabase.rpc(
    "complete_daily_challenge",
    {
      p_user_id: userId,
      p_challenge_id: challengeId,
    }
  );

  if (error) {
    console.error("Error completing challenge:", error);
    return NextResponse.json(
      { error: "Failed to complete challenge" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    completed: result,
    message: result ? "Challenge completed!" : "Challenge progress updated",
  });
}

async function addPoints(supabase: any, userId: string, data: any) {
  const { points, source, sourceId = null, description = null } = data;

  const { error } = await supabase.rpc("add_points_to_user", {
    p_user_id: userId,
    p_points: points,
    p_source: source,
    p_source_id: sourceId,
    p_description: description,
  });

  if (error) {
    console.error("Error adding points:", error);
    return NextResponse.json(
      { error: "Failed to add points" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
