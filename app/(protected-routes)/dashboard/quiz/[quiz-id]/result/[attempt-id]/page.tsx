"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Trophy,
  Target,
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  Lightbulb,
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface QuestionResult {
  id: string;
  text: string;
  kind: "single" | "multiple";
  options: string[];
  correctAnswers: number[];
  userAnswer: number[] | null;
  isCorrect: boolean;
  explanation?: string;
  points: number;
}

interface AttemptResult {
  attempt: {
    id: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    timeTaken: number;
    startedAt: string;
    completedAt: string;
  };
  quiz: {
    id: string;
    title: string;
    description?: string;
    subject: string;
    academic_level?: string;
  };
  questions: QuestionResult[];
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    score: number;
    percentage: number;
    timeTaken: number;
  };
}

interface AttemptDetailProps {
  params: Promise<{
    "quiz-id": string;
    "attempt-id": string;
  }>;
}

const AttemptDetailPage: React.FC<AttemptDetailProps> = ({ params }) => {
  const router = useRouter();
  const [attemptData, setAttemptData] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  const resolvedParams = React.use(params);
  const quizId = resolvedParams["quiz-id"];
  const attemptId = resolvedParams["attempt-id"];

  useEffect(() => {
    fetchAttemptDetails();
  }, [quizId, attemptId]);

  const fetchAttemptDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/quiz/${quizId}/attempts/${attemptId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch attempt details");
      }

      const result = await response.json();
      setAttemptData(result.data);
    } catch (error) {
      console.error("Error fetching attempt details:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load attempt details"
      );
    } finally {
      setIsLoading(false);
    }
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

  const getQuestionIcon = (question: QuestionResult) => {
    if (question.userAnswer === null) {
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
    return question.isCorrect ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getQuestionBorderColor = (question: QuestionResult) => {
    if (question.userAnswer === null)
      return "border-gray-200 dark:border-gray-700";
    return question.isCorrect
      ? "border-green-200 dark:border-green-900"
      : "border-red-200 dark:border-red-900";
  };

  const getQuestionBgColor = (question: QuestionResult) => {
    if (question.userAnswer === null) return "bg-gray-50 dark:bg-gray-900";
    return question.isCorrect
      ? "bg-green-50 dark:bg-green-900"
      : "bg-red-50 dark:bg-red-900";
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const renderAnswerChoice = (
    option: string,
    index: number,
    question: QuestionResult
  ) => {
    const isUserAnswer = question.userAnswer?.includes(index);
    const isCorrectAnswer = question.correctAnswers.includes(index);
    const wasAnswered = question.userAnswer !== null;

    let bgColor = "";
    let textColor = "";
    let borderColor = "";

    if (!wasAnswered) {
      // Not answered - show correct answers highlighted
      if (isCorrectAnswer) {
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        borderColor = "border-green-300";
      }
    } else {
      // Was answered - show user vs correct
      if (isUserAnswer && isCorrectAnswer) {
        // User selected correct answer
        bgColor = "bg-green-100 dark:bg-green-900";
        textColor = "text-green-800 dark:text-green-400";
        borderColor = "border-green-300 dark:border-green-700";
      } else if (isUserAnswer && !isCorrectAnswer) {
        // User selected wrong answer
        bgColor = "bg-red-100 dark:bg-red-900";
        textColor = "text-red-800 dark:text-red-400";
        borderColor = "border-red-300 dark:border-red-700";
      } else if (!isUserAnswer && isCorrectAnswer) {
        // User didn't select but it was correct
        bgColor = "bg-green-50 dark:bg-green-900";
        textColor = "text-green-700 dark:text-green-400";
        borderColor = "border-green-200 dark:border-green-700";
      }
    }

    return (
      <div
        key={index}
        className={cn(
          "rounded-md border transition-all",
          bgColor,
          textColor,
          borderColor || "border-gray-200"
        )}
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {String.fromCharCode(65 + index)}.
          </span>
          <span>{option}</span>
          {isUserAnswer && (
            <Badge variant="outline" className="ml-auto">
              Your Answer
            </Badge>
          )}
          {isCorrectAnswer && !isUserAnswer && wasAnswered && (
            <Badge variant="secondary" className="ml-auto">
              Correct Answer
            </Badge>
          )}
          {isCorrectAnswer && !wasAnswered && (
            <Badge variant="secondary" className="ml-auto">
              Correct Answer
            </Badge>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading attempt details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push(`/dashboard/quiz/${quizId}/result`)}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div className="container max-w-4xl mx-auto">
        <Alert>
          <AlertDescription>No attempt details found.</AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push(`/dashboard/quiz/${quizId}/result`)}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
      </div>
    );
  }

  const { attempt, quiz, questions, summary } = attemptData;

  return (
    <div className="container max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between">
        <div className="flex flex-col md:flex-row md:items-center space-x-4">
          <Button
            onClick={() => router.push(`/dashboard/quiz/${quizId}/result`)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">Attempt Details & Review</p>
          </div>
        </div>
        <Badge
          variant={getGradeBadgeVariant(summary.percentage)}
          className="text-lg px-4 py-2"
        >
          {summary.percentage}%
        </Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{quiz.subject}</Badge>
              {quiz.academic_level && (
                <Badge variant="outline">Grade {quiz.academic_level}</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(attempt.timeTaken)}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>
                {summary.score}/{summary.totalQuestions} correct
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                getGradeColor(summary.percentage)
              )}
            >
              {summary.percentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              {summary.score} out of {summary.totalQuestions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Correct</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.correctAnswers}
            </div>
            <Progress
              value={(summary.correctAnswers / summary.totalQuestions) * 100}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Incorrect</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.incorrectAnswers}
            </div>
            <Progress
              value={(summary.incorrectAnswers / summary.totalQuestions) * 100}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span>Unanswered</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {summary.unanswered}
            </div>
            <Progress
              value={(summary.unanswered / summary.totalQuestions) * 100}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Question Review</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowExplanations(!showExplanations)}
            variant="outline"
            size="sm"
          >
            {showExplanations ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showExplanations ? "Hide" : "Show"} Explanations
          </Button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card
            key={question.id}
            className={cn(
              "transition-all",
              getQuestionBorderColor(question),
              getQuestionBgColor(question)
            )}
          >
            <Collapsible
              open={expandedQuestions.has(question.id)}
              onOpenChange={() => toggleQuestionExpansion(question.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getQuestionIcon(question)}
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Question {index + 1}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {question.text}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          question.kind === "multiple" ? "secondary" : "outline"
                        }
                      >
                        {question.kind === "multiple"
                          ? "Multiple Choice"
                          : "Single Choice"}
                      </Badge>
                      <Badge
                        variant={
                          question.isCorrect
                            ? "default"
                            : question.userAnswer === null
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {question.isCorrect
                          ? "Correct"
                          : question.userAnswer === null
                          ? "Skipped"
                          : "Incorrect"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) =>
                      renderAnswerChoice(option, optionIndex, question)
                    )}
                  </div>

                  {showExplanations && question.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">
                            Explanation
                          </h4>
                          <p className="text-blue-800 mt-1">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => router.push(`/dashboard/quiz/${quizId}/result`)}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Results
        </Button>
        <Button onClick={() => router.push(`/dashboard/quiz/${quizId}/answer`)}>
          <Target className="h-4 w-4 mr-2" />
          Retake Quiz
        </Button>
      </div>
    </div>
  );
};

export default AttemptDetailPage;
