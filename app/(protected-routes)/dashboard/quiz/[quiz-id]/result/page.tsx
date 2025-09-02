"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Trophy,
  Medal,
  Star,
  BarChart3,
  Eye,
  Loader2,
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
  grade_level: string;
  total_questions: number;
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
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBackToQuiz} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
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
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Quiz Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{quiz.subject}</Badge>
              {quiz.grade_level && (
                <Badge variant="outline">Grade {quiz.grade_level}</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{quiz.total_questions} questions</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{total_attempts} attempts</span>
            </div>
          </div>
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
            <CardHeader className="pb-3">
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
            <CardHeader className="pb-3">
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
            <CardHeader className="pb-3">
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
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
