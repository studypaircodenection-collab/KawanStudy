import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/quiz/[id]/submit - Submit quiz answers and get results
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: quizId } = await params;

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

    // Verify quiz exists and get quiz details for scoring
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id, title, time_limit_minutes")
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

    // Calculate sophisticated points based on quiz length and score
    const calculateQuizPoints = (
      score: number,
      totalQuestions: number,
      percentage: number,
      timeTaken: number,
      timeLimit?: number
    ): number => {
      // Base points calculation:
      // - Length bonus: 2 points per question (encourages taking longer quizzes)
      // - Performance bonus: up to 10 points based on percentage score
      // - Time bonus: up to 5 extra points for completing quickly (if time limit exists)
      
      const lengthBonus = totalQuestions * 2; // 2 points per question
      const performanceBonus = Math.floor(percentage / 10); // 1 point per 10% score
      
      let timeBonus = 0;
      if (timeLimit && timeLimit > 0) {
        const timeLimitSeconds = timeLimit * 60;
        const timeEfficiency = Math.max(0, (timeLimitSeconds - timeTaken) / timeLimitSeconds);
        timeBonus = Math.floor(timeEfficiency * 5); // Up to 5 bonus points for speed
      }
      
      // Minimum guaranteed points (even for 0% score)
      const minimumPoints = Math.max(5, Math.floor(totalQuestions / 2));
      
      const totalPoints = lengthBonus + performanceBonus + timeBonus;
      
      return Math.max(minimumPoints, totalPoints);
    };

    // Award points for quiz completion with enhanced scoring
    const pointsToAward = calculateQuizPoints(
      scoreResult.score,
      scoreResult.total,
      scoreResult.percentage,
      timeTaken,
      quiz.time_limit_minutes
    );
    
    // Note: Points are awarded in the /attempts endpoint, not here
    // This endpoint is for calculating scores and getting results only
    console.log("Quiz submit - Points calculation:", {
      pointsToAward,
      percentage: scoreResult.percentage,
      note: "Points will be awarded via /attempts endpoint"
    });

    // Note: Achievement checking is handled in the /attempts endpoint
    console.log("Quiz submit - Achievement checking will be handled via /attempts endpoint");

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
