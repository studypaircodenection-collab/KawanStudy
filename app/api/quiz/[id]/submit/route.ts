import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/quiz/[id]/submit - Submit quiz answers and get results
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id: quizId } = params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userAnswers, timeTaken, startedAt, completedAt } = body;

    // Validate required fields
    if (!userAnswers || !timeTaken || !startedAt || !completedAt) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userAnswers, timeTaken, startedAt, completedAt",
        },
        { status: 400 }
      );
    }

    // Verify quiz exists
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id, title")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Calculate score using database function
    const { data: scoreResult, error: scoreError } = await supabase.rpc(
      "calculate_quiz_score",
      {
        p_quiz_id: quizId,
        p_user_answers: userAnswers,
      }
    );

    if (scoreError) {
      console.error("Error calculating score:", scoreError);
      return NextResponse.json(
        { error: "Failed to calculate quiz score" },
        { status: 500 }
      );
    }

    // Save quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        user_answers: userAnswers,
        score: scoreResult.score,
        total_questions: scoreResult.total,
        percentage: scoreResult.percentage,
        time_taken: timeTaken,
        started_at: startedAt,
        completed_at: completedAt,
      })
      .select()
      .single();

    if (attemptError) {
      console.error("Error saving quiz attempt:", attemptError);
      return NextResponse.json(
        { error: "Failed to save quiz attempt" },
        { status: 500 }
      );
    }

    // Increment quiz play count
    try {
      await supabase.rpc("increment_quiz_play_count", { quiz_id: quizId });
    } catch (playCountError) {
      console.warn("Failed to increment play count:", playCountError);
    }

    // Award points for quiz completion
    const pointsToAward = Math.max(10, Math.floor(scoreResult.percentage / 10));
    try {
      await supabase.rpc("add_points_to_user", {
        p_user_id: user.id,
        p_points: pointsToAward,
        p_source: "quiz_completion",
        p_source_id: attempt.id,
        p_description: `Completed quiz: ${quiz.title} (${scoreResult.percentage}%)`,
      });
    } catch (pointsError) {
      console.warn("Failed to award points for quiz completion:", pointsError);
    }

    // Check for achievement progress
    try {
      // Check for quiz completion achievements
      const { data: userAttempts } = await supabase
        .from("quiz_attempts")
        .select("id")
        .eq("user_id", user.id);

      if (userAttempts) {
        const totalQuizzes = userAttempts.length;

        // Check achievements
        if (totalQuizzes === 1) {
          await supabase.rpc("complete_achievement", {
            p_user_id: user.id,
            p_achievement_key: "complete_quiz",
          });
        } else if (totalQuizzes === 3) {
          await supabase.rpc("complete_achievement", {
            p_user_id: user.id,
            p_achievement_key: "quiz_streak",
          });
        } else if (totalQuizzes === 5) {
          await supabase.rpc("complete_achievement", {
            p_user_id: user.id,
            p_achievement_key: "quiz_champion",
          });
        }
      }
    } catch (achievementError) {
      console.warn("Failed to update achievement progress:", achievementError);
    }

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        score: scoreResult.score,
        total: scoreResult.total,
        percentage: scoreResult.percentage,
        timeTaken,
        pointsAwarded: pointsToAward,
      },
    });
  } catch (error) {
    console.error("Error in quiz submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
