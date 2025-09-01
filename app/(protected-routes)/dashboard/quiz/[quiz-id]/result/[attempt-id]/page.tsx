"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Award,
  RotateCcw,
  BookOpen,
  Clock,
  Target,
  Share2,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { QuizAttempt, Question, QuestionKind } from "@/types/quiz";

// Result data structure for detailed view
interface QuizResultData {
  quiz: {
    id: string;
    title: string;
    description: string;
    subject: string;
    topic: string;
    academic_level: string;
    difficulty_level: string;
    estimated_time: number;
  };
  attempt: QuizAttempt;
  questions: Question[];
}

interface QuizResultProps {
  params: {
    "quiz-id": string;
  };
  searchParams: {
    attemptId?: string;
  };
}

// Mock data - in real app, this would come from API
const mockResultData: QuizResultData = {
  quiz: {
    id: "quiz_123",
    title: "Advanced Calculus - Derivatives and Integration",
    description:
      "Test your understanding of calculus fundamentals including derivatives, integration, and their applications",
    subject: "Mathematics",
    topic: "Calculus",
    academic_level: "undergraduate",
    difficulty_level: "intermediate",
    estimated_time: 15,
  },
  attempt: {
    id: "attempt_789",
    quizId: "quiz_123",
    userId: "user_123",
    userAnswers: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 1 }, // Last answer is wrong
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    timeTaken: 720, // 12 minutes in seconds
    completedAt: "2025-01-15T10:30:00Z",
    createdAt: "2025-01-15T10:30:00Z",
    startedAt: "2025-01-15T10:18:00Z",
    updatedAt: "2025-01-15T10:30:00Z",
  },
  questions: [
    {
      id: "q1",
      kind: QuestionKind.Single,
      text: "What is the derivative of f(x) = 3x² + 2x - 1?",
      options: ["6x + 2", "6x² + 2x", "3x + 2", "6x - 1"],
      correct: 0,
      explanation:
        "Using the power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-1) = 0. Therefore, f'(x) = 6x + 2.",
    },
    {
      id: "q2",
      kind: QuestionKind.Single,
      text: "∫(2x + 3)dx = ?",
      options: ["x² + 3x + C", "2x² + 3x + C", "x² + 3x", "2x + 3x + C"],
      correct: 0,
      explanation: "∫2x dx = x² and ∫3 dx = 3x, so ∫(2x + 3)dx = x² + 3x + C",
    },
    {
      id: "q3",
      kind: QuestionKind.Single,
      text: "If f(x) = e^x, what is f'(x)?",
      options: ["e^x", "xe^x", "e^(x-1)", "1"],
      correct: 0,
      explanation:
        "The derivative of e^x is e^x itself. This is a fundamental property of the exponential function.",
    },
    {
      id: "q4",
      kind: QuestionKind.Single,
      text: "What is the chain rule formula?",
      options: [
        "(f ∘ g)'(x) = f'(g(x)) · g'(x)",
        "(f ∘ g)'(x) = f'(x) · g'(x)",
        "(f ∘ g)'(x) = f(g'(x))",
        "(f ∘ g)'(x) = f'(x) + g'(x)",
      ],
      correct: 0,
      explanation:
        "The chain rule states that the derivative of a composite function is the derivative of the outer function times the derivative of the inner function.",
    },
    {
      id: "q5",
      kind: QuestionKind.Single,
      text: "Find the critical points of f(x) = x³ - 3x² + 2",
      options: [
        "x = 0, x = 2",
        "x = 1, x = 3",
        "x = -1, x = 2",
        "x = 0, x = 3",
      ],
      correct: 0,
      explanation:
        "Critical points occur where f'(x) = 0. f'(x) = 3x² - 6x = 3x(x - 2) = 0, so x = 0 or x = 2.",
    },
  ],
};

const QuizResultPage: React.FC<QuizResultProps> = ({
  params,
  searchParams,
}) => {
  const router = useRouter();
  const [resultData, setResultData] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quizId = params["quiz-id"];
  const attemptId = searchParams.attemptId || "mock-attempt";

  useEffect(() => {
    fetchQuizResult();
  }, [attemptId]);

  const fetchQuizResult = async () => {
    try {
      setLoading(true);
      // API call to get quiz result
      // const response = await fetch(`/api/quiz/result/${attemptId}`);
      // const data = await response.json();

      // if (data.success) {
      //   setResultData(data.result);
      // } else {
      //   setError(data.error || "Failed to load quiz results");
      // }
      setTimeout(() => {
        setResultData(mockResultData);
        setLoading(false);
      }, 1000); // Simulate loading time
    } catch (err) {
      setError("Network error while loading results");
      console.error("Error fetching quiz result:", err);
      // Use mock data for demo
      setResultData(mockResultData);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreVariant = (
    percentage: number
  ): "default" | "secondary" | "destructive" => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  const getBadgeVariant = (
    level: string
  ): "secondary" | "default" | "destructive" | "outline" => {
    switch (level) {
      case "beginner":
        return "secondary";
      case "intermediate":
        return "default";
      case "advanced":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleRetakeQuiz = () => {
    router.push(`/dashboard/quiz/${quizId}/answer`);
  };

  const handleShareResult = async () => {
    const shareData = {
      title: `Quiz Result: ${resultData?.quiz.title}`,
      text: `I scored ${resultData?.attempt.percentage}% on this ${resultData?.quiz.subject} quiz!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareData.url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading quiz results...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                Error Loading Results
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { quiz, attempt, questions } = resultData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-4">
              <Award className="h-16 w-16 text-primary mr-3" />
              <CardTitle className="text-4xl font-bold">
                Quiz Complete!
              </CardTitle>
            </div>

            <CardTitle className="text-2xl text-muted-foreground mb-2">
              {quiz.title}
            </CardTitle>
            <CardDescription className="text-base">
              Completed on {formatDate(attempt.completedAt)}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Score Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {attempt.score}/{attempt.totalQuestions}
                  </div>
                  <Badge
                    variant={getScoreVariant(attempt.percentage)}
                    className="text-lg px-4 py-2"
                  >
                    {attempt.percentage}%
                  </Badge>
                  <p className="text-muted-foreground mt-2">Score</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    <Clock className="h-8 w-8 inline-block mr-2" />
                    {formatTime(attempt.timeTaken)}
                  </div>
                  <p className="text-muted-foreground">Time Taken</p>
                  <p className="text-sm text-muted-foreground">
                    of {quiz.estimated_time} min limit
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Badge variant="outline" className="block">
                      {quiz.subject}
                    </Badge>
                    <Badge variant="outline" className="block">
                      {quiz.topic}
                    </Badge>
                    <Badge
                      variant={getBadgeVariant(quiz.difficulty_level)}
                      className="block"
                    >
                      {quiz.difficulty_level}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2">Quiz Info</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Performance Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Strengths</h4>
                    {attempt.percentage >= 80 ? (
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Excellent understanding of derivatives</li>
                        <li>• Strong grasp of integration concepts</li>
                        <li>• Good application of mathematical rules</li>
                      </ul>
                    ) : attempt.percentage >= 60 ? (
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Solid foundation in basic concepts</li>
                        <li>• Understanding of fundamental principles</li>
                        <li>• Room for improvement in application</li>
                      </ul>
                    ) : (
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Basic concepts need reinforcement</li>
                        <li>• Consider reviewing study materials</li>
                        <li>• Practice more problems</li>
                      </ul>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      Areas for Improvement
                    </h4>
                    {attempt.percentage >= 80 ? (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Try more advanced topics</li>
                        <li>• Challenge yourself with harder problems</li>
                        <li>• Share knowledge with peers</li>
                      </ul>
                    ) : (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Review incorrect answers</li>
                        <li>• Practice similar problems</li>
                        <li>• Study the explanations provided</li>
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Question Review */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Review</CardTitle>
                <CardDescription>
                  Review your answers and learn from explanations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.map((question, index) => {
                    const userAnswer = attempt.userAnswers[index];
                    const isCorrect =
                      userAnswer === (question as any).correctOptionIndex;

                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">
                              Question {index + 1}: {(question as any).content}
                            </h3>

                            <div className="space-y-2 mb-4">
                              {(question as any).options.map(
                                (option: string, optIndex: number) => {
                                  const isUserAnswer = userAnswer === optIndex;
                                  const isCorrectAnswer =
                                    (question as any).correctOptionIndex ===
                                    optIndex;

                                  let optionClass = "p-3 rounded border ";
                                  if (isCorrectAnswer) {
                                    optionClass +=
                                      "bg-green-50 border-green-200 text-green-800";
                                  } else if (isUserAnswer && !isCorrectAnswer) {
                                    optionClass +=
                                      "bg-red-50 border-red-200 text-red-800";
                                  } else {
                                    optionClass += "bg-gray-50 border-gray-200";
                                  }

                                  return (
                                    <div key={optIndex} className={optionClass}>
                                      <div className="flex items-center justify-between">
                                        <span>
                                          {String.fromCharCode(65 + optIndex)}.{" "}
                                          {option}
                                        </span>
                                        <div className="flex gap-2">
                                          {isUserAnswer && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              Your Answer
                                            </Badge>
                                          )}
                                          {isCorrectAnswer && (
                                            <Badge
                                              variant="default"
                                              className="text-xs"
                                            >
                                              Correct
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            <Alert>
                              <AlertDescription>
                                <strong>Explanation:</strong>{" "}
                                {(question as any).explanation}
                              </AlertDescription>
                            </Alert>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                onClick={handleRetakeQuiz}
                size="lg"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Retake Quiz
              </Button>

              <Button
                variant="outline"
                onClick={handleShareResult}
                size="lg"
                className="flex items-center gap-2"
              >
                <Share2 className="h-5 w-5" />
                Share Results
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/quiz/browse")}
                size="lg"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-5 w-5" />
                Browse More Quizzes
              </Button>
            </div>

            {/* Motivational Message */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                {attempt.percentage >= 80 ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">
                      Excellent Work!
                    </h3>
                    <p className="text-muted-foreground">
                      You've mastered this topic. Keep up the great work and
                      challenge yourself with more advanced material!
                    </p>
                  </div>
                ) : attempt.percentage >= 60 ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">
                      Good Progress!
                    </h3>
                    <p className="text-muted-foreground">
                      You're on the right track. Review the areas you missed and
                      try the quiz again to improve your score.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">
                      Keep Learning!
                    </h3>
                    <p className="text-muted-foreground">
                      Learning is a journey. Review the study materials,
                      practice more, and don't give up. You've got this!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizResultPage;
