"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Trophy,
  Medal,
  Star,
  BarChart3,
  Eye,
  Loader2,
  SparklesIcon,
  CheckCircle,
  AlertCircle,
  Clock,
  Shuffle,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AISummaryComponent from "@/components/quiz/ai-summary";

interface QuizAttempt {
  id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken: number;
  completed_at: string;
}

interface QuizInfo {
  id: string;
  title: string;
  description: string;
  subject: string;
  academic_level: string;
  total_questions: number;
  is_randomized?: boolean;
  time_limit?: number; // in minutes
}

interface QuizResultsData {
  quiz: QuizInfo;
  attempts: QuizAttempt[];
  best_attempt: QuizAttempt | null;
  total_attempts: number;
}

interface QuizResultProps {
  params: Promise<{
    "quiz-id": string;
  }>;
}

const QuizResultPage: React.FC<QuizResultProps> = ({ params }) => {
  const router = useRouter();
  const [resultsData, setResultsData] = useState<QuizResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedParams = React.use(params);
  const quizId = resolvedParams["quiz-id"];

  useEffect(() => {
    fetchQuizResults();
  }, [quizId]);

  const fetchQuizResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching quiz results for ID:", quizId);
      const response = await fetch(`/api/quiz/${quizId}/attempts`);
      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error("Failed to fetch quiz results");
      }

      const result = await response.json();
      console.log("Quiz results data:", result);
      setResultsData(result.data);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load results"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAttempt = (attemptId: string) => {
    router.push(`/dashboard/quiz/${quizId}/result/${attemptId}`);
  };

  const handleRetakeQuiz = () => {
    router.push(`/dashboard/quiz/${quizId}/answer`);
  };

  const handleBackToQuiz = () => {
    router.push(`/dashboard/quiz/${quizId}`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "default";
    if (percentage >= 80) return "secondary";
    if (percentage >= 70) return "outline";
    return "destructive";
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 90) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (percentage >= 80) return <Medal className="h-5 w-5 text-gray-400" />;
    if (percentage >= 70) return <Star className="h-5 w-5 text-yellow-600" />;
    return <Target className="h-5 w-5 text-gray-500" />;
  };

  // Check if quiz meets AI Summary requirements
  const meetsAISummaryRequirements = () => {
    if (!quiz) return false;

    const hasMinimumQuestions = quiz.total_questions >= 20;
    const isRandomized = quiz.is_randomized === true;
    const timePerQuestion = quiz.time_limit
      ? quiz.time_limit / quiz.total_questions
      : 0;
    const hasValidTimeLimit = timePerQuestion <= 2.5; // 2.5 minutes per question

    return hasMinimumQuestions && isRandomized && hasValidTimeLimit;
  };

  const getAISummaryRequirementStatus = () => {
    if (!quiz) return [];

    const requirements = [
      {
        met: quiz.total_questions >= 20,
        text: `At least 20 questions (current: ${quiz.total_questions})`,
        icon:
          quiz.total_questions >= 20 ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ),
      },
      {
        met: quiz.is_randomized === true,
        text: "Quiz must be randomized",
        icon: quiz.is_randomized ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-600" />
        ),
      },
      {
        met: quiz.time_limit
          ? quiz.time_limit / quiz.total_questions <= 2.5
          : false,
        text: `Maximum 2.5 minutes per question ${
          quiz.time_limit
            ? `(current: ${(quiz.time_limit / quiz.total_questions).toFixed(
                1
              )} min/question)`
            : "(no time limit set)"
        }`,
        icon:
          quiz.time_limit && quiz.time_limit / quiz.total_questions <= 2.5 ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ),
      },
    ];

    return requirements;
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quiz results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push("/dashboard/quiz")}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
      </div>
    );
  }

  if (!resultsData || !resultsData.quiz) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>No quiz results found.</AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push("/dashboard/quiz")}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
      </div>
    );
  }

  const { quiz, attempts, best_attempt, total_attempts } = resultsData;
  const averageScore =
    attempts.length > 0
      ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
        attempts.length
      : 0;

  return (
    <div className="container max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between">
        <div className="flex flex-col md:flex-row md:items-center space-x-4">
          <Button onClick={handleBackToQuiz} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 md:mr-2" />
            Back to Quiz
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">Quiz Results & Performance</p>
          </div>
        </div>
        <Button
          onClick={handleRetakeQuiz}
          className="flex items-center space-x-2"
        >
          <Target className="h-4 w-4" />
          <span>Retake Quiz</span>
        </Button>
      </div>

      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Quiz Information</span>
            </div>
            {meetsAISummaryRequirements() && (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700"
              >
                <SparklesIcon className="h-3 w-3 mr-1" />
                AI Summary Eligible
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{quiz.subject}</Badge>
              {quiz.academic_level && (
                <Badge variant="outline">Grade {quiz.academic_level}</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{quiz.total_questions} questions</span>
              {quiz.total_questions >= 20 && (
                <CheckCircle className="h-3 w-3 text-green-600" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{total_attempts} attempts</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              {quiz.is_randomized ? (
                <>
                  <Shuffle className="h-4 w-4" />
                  <span>Randomized</span>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  <span>Sequential</span>
                </>
              )}
            </div>
          </div>
          {quiz.time_limit && (
            <div className="mt-4 flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {quiz.time_limit} minutes total (
                {(quiz.time_limit / quiz.total_questions).toFixed(1)}{" "}
                min/question)
              </span>
              {quiz.time_limit / quiz.total_questions <= 2.5 && (
                <CheckCircle className="h-3 w-3 text-green-600" />
              )}
            </div>
          )}
          {quiz.description && (
            <p className="mt-4 text-muted-foreground">{quiz.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Performance Overview */}
      {attempts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Best Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Best Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {best_attempt ? (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-600">
                    {best_attempt.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {best_attempt.score}/{best_attempt.total_questions} correct
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Time: {formatTime(best_attempt.time_taken)}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No attempts yet</div>
              )}
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span>Average Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">
                  {averageScore.toFixed(1)}%
                </div>
                <Progress value={averageScore} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  Across {total_attempts} attempts
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span>Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attempts.length >= 2 ? (
                  <>
                    <div className="text-3xl font-bold text-purple-600">
                      {(
                        attempts[0].percentage -
                        attempts[attempts.length - 1].percentage
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {attempts[0].percentage >
                      attempts[attempts.length - 1].percentage
                        ? "Improvement"
                        : "Change"}{" "}
                      from first attempt
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">
                    Take more attempts to see progress
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attempts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>All Attempts ({total_attempts})</span>
          </CardTitle>
          <CardDescription>
            Click on any attempt to view detailed results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No attempts yet</h3>
              <p className="text-muted-foreground mb-4">
                Take this quiz to see your results here
              </p>
              <Button onClick={handleRetakeQuiz}>Start Quiz</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleViewAttempt(attempt.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getPerformanceIcon(attempt.percentage)}
                      <span className="font-medium">
                        Attempt #{attempts.length - index}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </span>
                      <span>{formatTime(attempt.time_taken)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${getGradeColor(
                          attempt.percentage
                        )}`}
                      >
                        {attempt.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {attempt.score}/{attempt.total_questions}
                      </div>
                    </div>
                    <Badge variant={getGradeBadgeVariant(attempt.percentage)}>
                      {attempt.percentage >= 90
                        ? "Excellent"
                        : attempt.percentage >= 80
                        ? "Good"
                        : attempt.percentage >= 70
                        ? "Fair"
                        : attempt.percentage >= 60
                        ? "Pass"
                        : "Needs Improvement"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI SUMMARY */}
      {meetsAISummaryRequirements() ? (
        <AISummaryComponent quizId={quizId} attemptsCount={total_attempts} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5 text-gray-400" />
              <span>AI Summary</span>
            </CardTitle>
            <CardDescription>
              AI-powered performance analysis and personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">
                    This quiz doesn't meet the requirements for AI Summary
                    analysis.
                  </p>
                  <p className="text-sm">
                    To enable AI Summary, the quiz must meet all of the
                    following criteria:
                  </p>
                  <div className="space-y-2">
                    {getAISummaryRequirementStatus().map(
                      (requirement, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          {requirement.icon}
                          <span
                            className={
                              requirement.met
                                ? "text-green-700"
                                : "text-red-700"
                            }
                          >
                            {requirement.text}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Lightbulb className="h-4 w-4" />
                      <span>
                        AI Summary provides detailed performance analysis,
                        identifies knowledge gaps, and offers personalized study
                        recommendations for comprehensive quizzes.
                      </span>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button onClick={handleBackToQuiz} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quiz Details
        </Button>
        <Button onClick={handleRetakeQuiz}>
          <Target className="h-4 w-4 mr-2" />
          Take Quiz Again
        </Button>
      </div>
    </div>
  );
};

export default QuizResultPage;
