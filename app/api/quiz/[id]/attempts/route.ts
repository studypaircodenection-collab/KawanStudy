import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/quiz/[id]/attempts - Get quiz attempts for a user
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Get user's quiz attempts using database function
    console.log("Fetching attempts for user:", user.id, "quiz:", quizId);
    const { data: attemptsData, error } = await supabase.rpc(
      "get_user_quiz_attempts",
      {
        p_user_id: user.id,
        p_quiz_id: quizId,
      }
    );

    console.log("Attempts data from DB:", attemptsData);
    console.log("Attempts error:", error);

    if (error) {
      console.error("Error fetching quiz attempts:", error);
      return NextResponse.json(
        { error: "Failed to fetch quiz attempts" },
        { status: 500 }
      );
    }

    if (!attemptsData || !attemptsData.quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Add rank to attempts
    const attemptsWithRank = (attemptsData.attempts || [])
      .sort(
        (a: any, b: any) =>
          b.percentage - a.percentage || a.time_taken - b.time_taken
      )
      .map((attempt: any, index: number) => ({
        ...attempt,
        rank: index + 1,
      }));

    return NextResponse.json({
      success: true,
      data: {
        quiz: attemptsData.quiz,
        attempts: attemptsWithRank,
        best_attempt: attemptsData.best_attempt,
        total_attempts: attemptsData.total_attempts,
      },
    });
  } catch (error) {
    console.error("Error in quiz attempts GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/quiz/[id]/attempts - Submit a quiz attempt
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const { score, totalQuestions, percentage, timeTaken, answers } = body;

    // Validate required fields
    if (
      score === undefined ||
      totalQuestions === undefined ||
      percentage === undefined ||
      timeTaken === undefined ||
      !answers
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Submitting quiz attempt:", {
      quizId,
      userId: user.id,
      score,
      totalQuestions,
      percentage,
      timeTaken,
    });

    // Insert quiz attempt
    const { data: attemptData, error: insertError } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        user_answers: answers,
        score: score,
        total_questions: totalQuestions,
        percentage: percentage,
        time_taken: timeTaken,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting quiz attempt:", insertError);
      return NextResponse.json(
        { error: "Failed to save quiz attempt" },
        { status: 500 }
      );
    }

    console.log("Quiz attempt saved:", attemptData);

    // Increment quiz play count
    try {
      await supabase.rpc("increment_quiz_play_count", { p_quiz_id: quizId });
    } catch (playCountError) {
      console.warn("Failed to increment play count:", playCountError);
    }

    return NextResponse.json({
      success: true,
      data: attemptData,
      message: "Quiz attempt submitted successfully",
    });
  } catch (error) {
    console.error("Error in quiz attempts POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
