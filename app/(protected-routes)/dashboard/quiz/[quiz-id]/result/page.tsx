"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Clock,
  Target,
  TrendingUp,
  Eye,
  Calendar,
  Trophy,
  BarChart3,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Minus,
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
import { useRouter } from "next/navigation";
import { QuizAttemptsData, QuizAttemptSummary } from "@/types/quiz";

interface QuizAttemptsProps {
  params: {
    "quiz-id": string;
  };
}

// Mock data - showing multiple attempts for demonstration
const mockAttemptsData: QuizAttemptsData = {
  quiz: {
    id: "quiz_123",
    title: "Advanced Calculus - Derivatives and Integration",
    description:
      "Test your understanding of calculus fundamentals including derivatives, integration, and their applications",
    subject: "Mathematics",
    topic: "Calculus",
    difficulty_level: "intermediate",
    totalQuestions: 5,
  },
  attempts: [
    {
      id: "attempt_005",
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      timeTaken: 480, // 8 minutes
      completedAt: "2025-01-22T16:20:00Z",
      rank: 1,
    },
    {
      id: "attempt_004",
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      timeTaken: 540, // 9 minutes
      completedAt: "2025-01-21T11:45:00Z",
      rank: 2,
    },
    {
      id: "attempt_003",
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      timeTaken: 600, // 10 minutes
      completedAt: "2025-01-20T14:30:00Z",
      rank: 1,
    },
    {
      id: "attempt_002",
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      timeTaken: 720, // 12 minutes
      completedAt: "2025-01-18T10:15:00Z",
      rank: 3,
    },
    {
      id: "attempt_001",
      score: 3,
      totalQuestions: 5,
      percentage: 60,
      timeTaken: 900, // 15 minutes
      completedAt: "2025-01-15T16:45:00Z",
      rank: 5,
    },
  ],
  bestAttempt: {
    id: "attempt_005",
    score: 5,
    totalQuestions: 5,
    percentage: 100,
    timeTaken: 480,
    completedAt: "2025-01-22T16:20:00Z",
    rank: 1,
  },
  totalAttempts: 5,
};

// Format time helper
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Format date helper
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get performance badge
const getPerformanceBadge = (percentage: number) => {
  if (percentage >= 90)
    return { text: "Excellent", variant: "default" as const };
  if (percentage >= 80) return { text: "Good", variant: "secondary" as const };
  if (percentage >= 70) return { text: "Fair", variant: "outline" as const };
  return { text: "Needs Improvement", variant: "destructive" as const };
};

// Get improvement indicator
const getImprovementIndicator = (
  currentPercentage: number,
  previousPercentage?: number
) => {
  if (!previousPercentage) return null;

  const diff = currentPercentage - previousPercentage;
  if (diff > 0) {
    return {
      icon: <ArrowUp className="h-4 w-4 text-green-600" />,
      text: `+${diff}%`,
      color: "text-green-600",
    };
  } else if (diff < 0) {
    return {
      icon: <ArrowDown className="h-4 w-4 text-red-600" />,
      text: `${diff}%`,
      color: "text-red-600",
    };
  } else {
    return {
      icon: <Minus className="h-4 w-4 text-gray-500" />,
      text: "No change",
      color: "text-gray-500",
    };
  }
};

const QuizAttemptsPage: React.FC<QuizAttemptsProps> = ({ params }) => {
  const quizId = params["quiz-id"];
  const router = useRouter();
  const [attemptsData, setAttemptsData] = useState<QuizAttemptsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchAttempts = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/quiz/${quizId}/attempts`);
        // const data = await response.json();

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        setAttemptsData(mockAttemptsData);
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [quizId]);

  const handleViewAttempt = (attemptId: string) => {
    router.push(`/dashboard/quiz/${quizId}/result/${attemptId}`);
  };

  const handleRetakeQuiz = () => {
    router.push(`/dashboard/quiz/${quizId}/answer`);
  };

  const handleBackToQuizzes = () => {
    router.push("/dashboard/quiz");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!attemptsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quiz Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The quiz you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button onClick={handleBackToQuizzes}>Back to Quizzes</Button>
        </div>
      </div>
    );
  }

  const { quiz, attempts, bestAttempt, totalAttempts } = attemptsData;

  // Calculate statistics
  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
            attempts.length
        )
      : 0;

  const totalTimeSpent = attempts.reduce(
    (sum, attempt) => sum + attempt.timeTaken,
    0
  );

  const improvement =
    attempts.length > 1
      ? attempts[0].percentage - attempts[attempts.length - 1].percentage
      : 0;

  // Calculate average improvement per attempt
  const averageImprovement =
    attempts.length > 1 ? improvement / (attempts.length - 1) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <BookOpen className="h-4 w-4" />
            <span>{quiz.subject}</span>
            <span>•</span>
            <span>{quiz.topic}</span>
            <Badge variant="outline" className="ml-2">
              {quiz.difficulty_level}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Attempts: {quiz.title}
          </h1>
          <p className="text-gray-600 mb-6">{quiz.description}</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Attempts
                  </p>
                  <div className="text-2xl font-bold">{totalAttempts}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Best Score
                  </p>
                  <div className="text-2xl font-bold">
                    {bestAttempt ? `${bestAttempt.percentage}%` : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Average Score
                  </p>
                  <div className="text-2xl font-bold">{averageScore}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Time
                  </p>
                  <div className="text-2xl font-bold">
                    {formatTime(totalTimeSpent)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div
                  className={`text-3xl font-bold ${
                    improvement >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {improvement >= 0 ? "+" : ""}
                  {improvement}%
                </div>
                <p className="text-sm text-gray-600">Total Improvement</p>
                <p className="text-xs text-gray-500 mt-1">First to Latest</p>
              </div>
              <div className="text-center">
                <div
                  className={`text-3xl font-bold ${
                    averageImprovement >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {averageImprovement >= 0 ? "+" : ""}
                  {averageImprovement.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Avg per Attempt</p>
                <p className="text-xs text-gray-500 mt-1">Progress Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(totalTimeSpent / attempts.length / 60)}m
                </div>
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-xs text-gray-500 mt-1">Per Attempt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Attempt Highlight */}
        {bestAttempt && (
          <Card className="mb-8 border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-600" />
                Your Best Performance
              </CardTitle>
              <CardDescription>
                Your highest scoring attempt with detailed breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-700">
                    {bestAttempt.percentage}%
                  </div>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-700">
                    {formatTime(bestAttempt.timeTaken)}
                  </div>
                  <p className="text-sm text-gray-600">Time</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-700">
                    {formatDate(bestAttempt.completedAt)}
                  </div>
                  <p className="text-sm text-gray-600">Date</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-700">
                    #{bestAttempt.rank || 1}
                  </div>
                  <p className="text-sm text-gray-600">Rank</p>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => handleViewAttempt(bestAttempt.id)}
                  variant="outline"
                  size="sm"
                  className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Detailed Results
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attempts List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>All Attempts History</CardTitle>
            <CardDescription>
              Complete history of your quiz attempts with performance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attempts.map((attempt, index) => {
                const performanceBadge = getPerformanceBadge(
                  attempt.percentage
                );
                const isLatest = index === 0;
                const isBest = attempt.id === bestAttempt?.id;
                const previousAttempt = attempts[index + 1];
                const improvement = getImprovementIndicator(
                  attempt.percentage,
                  previousAttempt?.percentage
                );

                return (
                  <div
                    key={attempt.id}
                    className={`p-6 border rounded-lg transition-all hover:shadow-md ${
                      isLatest
                        ? "border-blue-200 bg-blue-50"
                        : isBest
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">
                            Attempt #{totalAttempts - index}
                          </h3>
                          {isLatest && (
                            <Badge variant="secondary" className="text-xs">
                              Latest
                            </Badge>
                          )}
                          {isBest && (
                            <Badge variant="default" className="text-xs">
                              🏆 Best
                            </Badge>
                          )}
                          <Badge
                            variant={performanceBadge.variant}
                            className="text-xs"
                          >
                            {performanceBadge.text}
                          </Badge>
                          {improvement && (
                            <div
                              className={`flex items-center gap-1 text-xs ${improvement.color}`}
                            >
                              {improvement.icon}
                              <span>{improvement.text}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-500" />
                            <div>
                              <span className="font-medium">
                                {attempt.score}/{attempt.totalQuestions}
                              </span>
                              <span className="text-gray-500 ml-2">
                                ({attempt.percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{formatTime(attempt.timeTaken)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(attempt.completedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-gray-500" />
                            <span>Rank #{attempt.rank || "N/A"}</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full ${
                              attempt.percentage >= 90
                                ? "bg-green-500"
                                : attempt.percentage >= 80
                                ? "bg-blue-500"
                                : attempt.percentage >= 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${attempt.percentage}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleViewAttempt(attempt.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {attempts.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Attempts Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t taken this quiz yet. Start your first
                  attempt!
                </p>
                <Button onClick={handleRetakeQuiz}>Take Quiz Now</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleRetakeQuiz} size="lg" className="min-w-40">
            <BookOpen className="h-5 w-5 mr-2" />
            {attempts.length > 0 ? "Take Quiz Again" : "Start Quiz"}
          </Button>
          <Button
            onClick={handleBackToQuizzes}
            variant="outline"
            size="lg"
            className="min-w-40"
          >
            Back to All Quizzes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizAttemptsPage;
