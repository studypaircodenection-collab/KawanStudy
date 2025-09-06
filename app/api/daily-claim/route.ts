import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has already claimed points today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const { data: existingClaim, error: checkError } = await supabase
      .from('point_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('source', 'daily_claim')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking daily claim:', checkError);
      return NextResponse.json(
        { error: "Failed to check daily claim status" },
        { status: 500 }
      );
    }

    if (existingClaim) {
      return NextResponse.json(
        { error: "Daily points already claimed today" },
        { status: 400 }
      );
    }

    // Award 50 points
    const pointsToAward = 50;
    
    const { error: pointsError } = await supabase.rpc("add_points_to_user", {
      p_user_id: user.id,
      p_points: pointsToAward,
      p_source: "daily_claim",
      p_source_id: null,
      p_description: "Daily points claim",
    });

    if (pointsError) {
      console.error('Error adding points:', pointsError);
      return NextResponse.json(
        { error: "Failed to award points" },
        { status: 500 }
      );
    }

    // Log activity without awarding points again (p_points_earned: 0)
    await supabase.rpc("log_user_activity", {
      p_user_id: user.id,
      p_activity_type: "daily_claim",
      p_activity_data: {
        points_claimed: pointsToAward,
        claim_date: today
      },
      p_points_earned: 0
    });

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${pointsToAward} points!`,
      pointsAwarded: pointsToAward
    });

  } catch (error) {
    console.error("Error in daily claim:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
