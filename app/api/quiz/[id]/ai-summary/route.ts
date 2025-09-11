import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateQuizPerformanceSummary,
  shouldRegenerateAISummary,
} from "@/lib/ai/quiz-analysis";

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  console.log("AI Summary API called for quiz:", params.quizId);

  try {
    // Check if DEEPSEEK_API_KEY is configured
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error("DEEPSEEK_API_KEY is not configured");
      return NextResponse.json(
        {
          error:
            "AI service not configured. Please add DEEPSEEK_API_KEY to environment variables.",
        },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("Unauthorized request - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizId = params.quizId;
    console.log("Processing AI summary for user:", user.id, "quiz:", quizId);

    // Get quiz information
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("title, description, subject, academic_level, total_questions")
      .eq("quiz_id", quizId)
      .single();

    if (quizError || !quiz) {
      console.error("Quiz not found:", quizError);
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    console.log("Found quiz:", quiz.title);

    // Get user's quiz attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select(
        `
        id,
        score,
        total_questions,
        percentage,
        time_taken,
        completed_at 
      `
      )
      .eq("quiz_id", quizId)
      .eq("user_id", user.id)
      .order("completed_at", { ascending: true });

    if (attemptsError) {
      console.error("Failed to fetch attempts:", attemptsError);
      return NextResponse.json(
        { error: "Failed to fetch attempts" },
        { status: 500 }
      );
    }

    if (!attempts || attempts.length === 0) {
      console.log("No attempts found for quiz");
      return NextResponse.json(
        { error: "No attempts found for this quiz" },
        { status: 404 }
      );
    }

    console.log(`Found ${attempts.length} attempts for analysis`);

    // Check if we already have a summary and if it needs regeneration
    const { data: existingSummary } = await supabase
      .from("quiz_ai_summaries")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", user.id)
      .single();

    // Determine if we need to generate/regenerate the summary
    const needsRegeneration =
      !existingSummary ||
      shouldRegenerateAISummary(
        attempts.length,
        existingSummary.attempts_analyzed,
        2
      );

    if (!needsRegeneration && existingSummary) {
      console.log("Returning cached AI summary");
      return NextResponse.json({
        success: true,
        data: {
          summary: existingSummary.summary_text,
          trend_analysis: existingSummary.trend_analysis,
          strengths: existingSummary.strengths
            ? existingSummary.strengths.split("|")
            : [],
          weaknesses: existingSummary.weaknesses
            ? existingSummary.weaknesses.split("|")
            : [],
          recommendations: existingSummary.recommendations
            ? existingSummary.recommendations.split("|")
            : [],
          last_updated: existingSummary.updated_at,
          attempts_analyzed: existingSummary.attempts_analyzed,
          from_cache: true,
        },
      });
    }

    // Generate new AI summary
    console.log("Generating new AI summary...");
    const analysisResult = await generateQuizPerformanceSummary(quiz, attempts);

    if (!analysisResult.success || !analysisResult.analysis) {
      console.error("AI analysis failed:", analysisResult.error);
      return NextResponse.json(
        { error: analysisResult.error || "Failed to generate AI summary" },
        { status: 500 }
      );
    }

    console.log("AI analysis successful, saving to database...");

    const analysis = analysisResult.analysis;
    const latestAttempt = attempts[attempts.length - 1];

    // Save/update the summary in the database
    const summaryData = {
      user_id: user.id,
      quiz_id: quizId,
      summary_text: analysis.overall_performance,
      attempts_analyzed: attempts.length,
      last_attempt_score: latestAttempt.percentage,
      trend_analysis: analysis.trend_analysis,
      strengths: analysis.strengths.join("|"),
      weaknesses: analysis.weaknesses.join("|"),
      recommendations: analysis.recommendations.join("|"),
      updated_at: new Date().toISOString(),
    };

    let savedSummary;
    if (existingSummary) {
      // Update existing summary
      const { data, error } = await supabase
        .from("quiz_ai_summaries")
        .update(summaryData)
        .eq("id", existingSummary.id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update AI summary:", error);
        // Continue anyway, return the generated analysis
      } else {
        savedSummary = data;
      }
    } else {
      // Create new summary
      const { data, error } = await supabase
        .from("quiz_ai_summaries")
        .insert(summaryData)
        .select()
        .single();

      if (error) {
        console.error("Failed to save AI summary:", error);
        // Continue anyway, return the generated analysis
      } else {
        savedSummary = data;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: analysis.overall_performance,
        trend_analysis: analysis.trend_analysis,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        confidence_level: analysis.confidence_level,
        last_updated: savedSummary?.updated_at || new Date().toISOString(),
        attempts_analyzed: attempts.length,
        from_cache: false,
      },
    });
  } catch (error) {
    console.error("Error in AI summary generation:", error);

    // Check if it's a specific error type
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error:
            "Invalid response from AI service. Please check API configuration.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizId = params.quizId;

    // Get existing summary
    const { data: summary, error } = await supabase
      .from("quiz_ai_summaries")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", user.id)
      .single();

    if (error || !summary) {
      return NextResponse.json(
        { error: "No AI summary found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: summary.summary_text,
        trend_analysis: summary.trend_analysis,
        strengths: summary.strengths ? summary.strengths.split("|") : [],
        weaknesses: summary.weaknesses ? summary.weaknesses.split("|") : [],
        recommendations: summary.recommendations
          ? summary.recommendations.split("|")
          : [],
        last_updated: summary.updated_at,
        attempts_analyzed: summary.attempts_analyzed,
        from_cache: true,
      },
    });
  } catch (error) {
    console.error("Error fetching AI summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
