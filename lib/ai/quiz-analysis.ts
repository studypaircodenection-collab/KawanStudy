import {
  generateDeepSeekObject,
  generateDeepSeekText,
  DEEPSEEK_MODELS,
} from "./deepseek";
import { z } from "zod";

// Schema for structured quiz performance analysis
export const QuizPerformanceAnalysisSchema = z.object({
  overall_performance: z
    .string()
    .describe("Overall performance assessment in 2-3 sentences"),
  trend_analysis: z
    .string()
    .describe("Performance trend analysis (improving, declining, consistent)"),
  strengths: z.array(z.string()).describe("List of identified strengths"),
  weaknesses: z.array(z.string()).describe("List of areas needing improvement"),
  recommendations: z
    .array(z.string())
    .describe("Specific recommendations for improvement"),
  confidence_level: z
    .enum(["high", "medium", "low"])
    .describe("AI confidence in the analysis"),
});

export type QuizPerformanceAnalysis = z.infer<
  typeof QuizPerformanceAnalysisSchema
>;

export interface QuizAttemptData {
  id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken: number;
  completed_at: string;
  user_answers?: Array<{
    question_id: string;
    selected_answer: string;
    is_correct: boolean;
    question_text?: string;
    correct_answer?: string;
  }>;
}

export interface QuizInfo {
  title: string;
  description?: string;
  subject: string;
  academic_level?: string;
  total_questions: number;
}

// Generate performance summary for quiz attempts
export async function generateQuizPerformanceSummary(
  quizInfo: QuizInfo,
  attempts: QuizAttemptData[]
): Promise<{
  success: boolean;
  analysis?: QuizPerformanceAnalysis;
  error?: string;
}> {
  try {
    // Prepare the prompt with quiz and attempt data
    const prompt = createPerformanceAnalysisPrompt(quizInfo, attempts);

    // Generate structured analysis
    const result = await generateDeepSeekObject(
      prompt,
      QuizPerformanceAnalysisSchema,
      {
        model: DEEPSEEK_MODELS.CHAT,
        temperature: 0.3, // Lower temperature for more consistent analysis
        maxTokens: 1500,
      }
    );

    if (!result.success || !result.object) {
      return {
        success: false,
        error: result.error || "Failed to generate analysis",
      };
    }

    return { success: true, analysis: result.object };
  } catch (error) {
    console.error("Error generating quiz performance summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Generate a simple text summary (fallback option)
export async function generateSimplePerformanceSummary(
  quizInfo: QuizInfo,
  attempts: QuizAttemptData[]
): Promise<{ success: boolean; summary?: string; error?: string }> {
  try {
    const prompt = createSimpleSummaryPrompt(quizInfo, attempts);

    const result = await generateDeepSeekText(prompt, {
      model: DEEPSEEK_MODELS.CHAT,
      temperature: 0.4,
      maxTokens: 800,
    });

    if (!result.success || !result.text) {
      return {
        success: false,
        error: result.error || "Failed to generate summary",
      };
    }

    return { success: true, summary: result.text };
  } catch (error) {
    console.error("Error generating simple performance summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

function createPerformanceAnalysisPrompt(
  quizInfo: QuizInfo,
  attempts: QuizAttemptData[]
): string {
  const sortedAttempts = attempts.sort(
    (a, b) =>
      new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );

  const latestAttempt = sortedAttempts[sortedAttempts.length - 1];
  const firstAttempt = sortedAttempts[0];
  const averageScore =
    attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
    attempts.length;
  const bestScore = Math.max(...attempts.map((a) => a.percentage));
  const worstScore = Math.min(...attempts.map((a) => a.percentage));

  return `Analyze the student's performance on the following quiz:

Quiz Information:
- Title: ${quizInfo.title}
- Subject: ${quizInfo.subject}
- Academic Level: ${quizInfo.academic_level || "Not specified"}
- Total Questions: ${quizInfo.total_questions}
- Description: ${quizInfo.description || "No description provided"}

Performance Data:
- Total Attempts: ${attempts.length}
- Average Score: ${averageScore.toFixed(1)}%
- Best Score: ${bestScore.toFixed(1)}%
- Worst Score: ${worstScore.toFixed(1)}%
- First Attempt: ${firstAttempt.percentage.toFixed(1)}% (${new Date(
    firstAttempt.completed_at
  ).toLocaleDateString()})
- Latest Attempt: ${latestAttempt.percentage.toFixed(1)}% (${new Date(
    latestAttempt.completed_at
  ).toLocaleDateString()})

Detailed Attempts:
${sortedAttempts
  .map(
    (attempt, index) =>
      `Attempt ${index + 1}: ${attempt.percentage.toFixed(1)}% (${
        attempt.score
      }/${attempt.total_questions}) - Time: ${formatTimeForPrompt(
        attempt.time_taken
      )} - Date: ${new Date(attempt.completed_at).toLocaleDateString()}`
  )
  .join("\n")}

Please provide a comprehensive analysis of this student's performance, focusing on:
1. Overall performance assessment
2. Learning trend (improvement, decline, or consistency)
3. Identified strengths
4. Areas needing improvement
5. Specific, actionable recommendations for better performance

Be encouraging but honest, and provide practical advice that can help the student improve.`;
}

function createSimpleSummaryPrompt(
  quizInfo: QuizInfo,
  attempts: QuizAttemptData[]
): string {
  const averageScore =
    attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
    attempts.length;
  const latestScore = attempts[attempts.length - 1]?.percentage || 0;
  const firstScore = attempts[0]?.percentage || 0;

  return `Create a brief, encouraging performance summary for a student who took the quiz "${
    quizInfo.title
  }" (${quizInfo.subject}).

Performance Data:
- ${attempts.length} attempts completed
- Average score: ${averageScore.toFixed(1)}%
- Latest score: ${latestScore.toFixed(1)}%
- Performance trend: ${
    latestScore > firstScore
      ? "Improving"
      : latestScore < firstScore
      ? "Declining"
      : "Consistent"
  }

Write a 2-3 sentence summary that is encouraging and provides actionable advice. Focus on being positive while identifying areas for improvement.`;
}

function formatTimeForPrompt(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

// Check if AI summary needs to be regenerated
export function shouldRegenerateAISummary(
  currentAttempts: number,
  lastAnalyzedAttempts: number,
  threshold: number = 3
): boolean {
  return currentAttempts - lastAnalyzedAttempts >= threshold;
}
