import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
    attemptId: string;
  }>;
}

// GET /api/quiz/[id]/attempts/[attemptId] - Get specific attempt details with answers
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: quizId, attemptId } = await params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the specific attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("user_id", user.id) // Ensure user can only see their own attempts
      .eq("quiz_id", quizId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Get quiz details and questions
    const { data: quizData, error: quizError } = await supabase.rpc(
      "get_quiz_with_questions",
      { p_quiz_id: quizId }
    );

    if (quizError || !quizData) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Process each question to show user answers vs correct answers
    const questionsWithResults = (quizData.questions || []).map(
      (question: any) => {
        const userAnswer = attempt.user_answers[question.id];
        const correctAnswers = question.correct;

        let isCorrect = false;
        if (userAnswer !== undefined && userAnswer !== null) {
          if (question.kind === "single") {
            isCorrect = userAnswer[0] === correctAnswers[0];
          } else {
            // Multiple choice - check if arrays match
            const userSorted = [...userAnswer].sort();
            const correctSorted = [...correctAnswers].sort();
            isCorrect =
              JSON.stringify(userSorted) === JSON.stringify(correctSorted);
          }
        }

        return {
          id: question.id,
          text: question.text,
          kind: question.kind,
          options: question.options,
          correctAnswers,
          userAnswer: userAnswer || null,
          isCorrect,
          explanation: question.explanation,
          points: isCorrect ? 1 : 0, // Simple scoring - 1 point per correct answer
        };
      }
    );

    const resultData = {
      attempt: {
        id: attempt.id,
        quizId: attempt.quiz_id,
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        percentage: attempt.percentage,
        timeTaken: attempt.time_taken,
        startedAt: attempt.started_at,
        completedAt: attempt.completed_at,
      },
      quiz: {
        id: quizData.quiz.id,
        title: quizData.quiz.title,
        description: quizData.quiz.description,
        subject: quizData.quiz.subject,
        academic_level: quizData.quiz.academic_level,
      },
      questions: questionsWithResults,
      summary: {
        totalQuestions: questionsWithResults.length,
        correctAnswers: questionsWithResults.filter((q: any) => q.isCorrect)
          .length,
        incorrectAnswers: questionsWithResults.filter((q: any) => !q.isCorrect)
          .length,
        unanswered: questionsWithResults.filter(
          (q: any) => q.userAnswer === null
        ).length,
        score: attempt.score,
        percentage: attempt.percentage,
        timeTaken: attempt.time_taken,
      },
    };

    return NextResponse.json({
      success: true,
      data: resultData,
    });
  } catch (error) {
    console.error("Error in attempt details GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
