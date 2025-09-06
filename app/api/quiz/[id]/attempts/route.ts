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

    // Get quiz details for gamification points calculation
    let pointsToAward = 0;
    let quizTitle = "Unknown Quiz";
    
    try {
      console.log("Fetching quiz details for gamification...");
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("title, time_limit_minutes")
        .eq("id", quizId)
        .single();

      console.log("Quiz data for gamification:", quiz, "Error:", quizError);

      if (!quizError && quiz) {
        quizTitle = quiz.title;
        
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
        pointsToAward = calculateQuizPoints(
          score,
          totalQuestions,
          percentage,
          timeTaken,
          quiz.time_limit_minutes
        );
        
        console.log("Calculated points to award:", pointsToAward);

        // Add points to user account
        console.log("Adding points to user account...");
        const addPointsResult = await supabase.rpc("add_points_to_user", {
          p_user_id: user.id,
          p_points: pointsToAward,
          p_source: "quiz_completion",
          p_source_id: attemptData.id,
          p_description: `Completed quiz: ${quiz.title} (${percentage}%) - ${totalQuestions} questions`,
        });
        
        console.log("Add points result:", addPointsResult);
        
        // Log activity for gamification tracking (without awarding points again)
        console.log("Logging activity for gamification...");
        const logActivityResult = await supabase.rpc("log_user_activity", {
          p_user_id: user.id,
          p_activity_type: "quiz",
          p_activity_data: {
            quiz_id: quizId,
            quiz_title: quiz.title,
            score: score,
            total_questions: totalQuestions,
            percentage: percentage,
            time_taken: timeTaken,
            points_earned: pointsToAward
          },
          p_points_earned: 0  // Set to 0 to avoid double-awarding points
        });

        console.log("Log activity result:", logActivityResult);

        // Check for achievement progress
        console.log("Checking for achievement progress...");
        const { data: userAttempts } = await supabase
          .from("quiz_attempts")
          .select("id")
          .eq("user_id", user.id);

        console.log("User attempts for achievements:", userAttempts);

        if (userAttempts) {
          const totalQuizzes = userAttempts.length;
          console.log("Total quizzes completed:", totalQuizzes);

          // Check achievements based on quiz completion milestones
          if (totalQuizzes === 1) {
            console.log("Awarding first quiz completion achievement...");
            await supabase.rpc("complete_achievement", {
              p_user_id: user.id,
              p_achievement_key: "complete_quiz",
            });
          } else if (totalQuizzes === 3) {
            console.log("Awarding quiz streak achievement...");
            await supabase.rpc("complete_achievement", {
              p_user_id: user.id,
              p_achievement_key: "quiz_streak",
            });
          } else if (totalQuizzes === 5) {
            console.log("Awarding quiz champion achievement...");
            await supabase.rpc("complete_achievement", {
              p_user_id: user.id,
              p_achievement_key: "quiz_champion",
            });
          }
        }
        
        console.log("Gamification logic completed successfully!");
      } else {
        console.log("Failed to fetch quiz details for gamification:", quizError);
      }
    } catch (pointsError) {
      console.warn("Failed to award points for quiz completion:", pointsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...attemptData,
        pointsAwarded: pointsToAward,
        quizTitle: quizTitle
      },
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
