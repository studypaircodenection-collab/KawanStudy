"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Target,
  Award,
  Play,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import {
  Quiz,
  Question,
  QuestionKind,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
} from "@/types/quiz";
import { toast } from "sonner";
import { dispatchPointsUpdate } from "@/lib/utils/points-events";

interface QuizAnswerProps {
  params: Promise<{
    "quiz-id": string;
  }>;
}

const QuizAnswerPage: React.FC<QuizAnswerProps> = ({ params }) => {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz taking state
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedParams = React.use(params);
  const quizId = resolvedParams["quiz-id"];

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!hasStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Answer page - Fetching quiz with ID:", quizId);
      const response = await fetch(`/api/quiz/${quizId}`);
      console.log(
        "Answer page - Response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Answer page - API Error:", errorText);
        throw new Error(
          `Failed to fetch quiz: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Answer page - API Result:", result);
      setQuiz(result.data);

      // Set initial time based on estimated time or default
      const estimatedMinutes =
        result.data.timeLimitMinutes || result.data.questions.length * 2;
      setTimeLeft(estimatedMinutes * 60);
    } catch (error) {
      console.error("Answer page - Error fetching quiz:", error);
      setError(error instanceof Error ? error.message : "Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setHasStarted(true);
  };

  const handleAnswerChange = (answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Calculate score properly
      let correctAnswers = 0;
      quiz.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        if (userAnswer !== undefined && userAnswer !== null) {
          if (question.kind === "single") {
            // Single choice: compare selected index with correct index
            if (userAnswer === question.correct) {
              correctAnswers++;
            }
          } else if (question.kind === "multiple") {
            // Multiple choice: compare arrays
            const userAnswerArray = Array.isArray(userAnswer)
              ? userAnswer.sort()
              : [];
            const correctArray = Array.isArray(question.correct)
              ? question.correct.sort()
              : [];
            if (
              JSON.stringify(userAnswerArray) === JSON.stringify(correctArray)
            ) {
              correctAnswers++;
            }
          }
        }
      });

      const timeTaken =
        (quiz.timeLimitMinutes || quiz.questions.length * 2) * 60 - timeLeft;
      const percentage = Math.round(
        (correctAnswers / quiz.questions.length) * 100
      );

      console.log("Submitting quiz attempt:", {
        score: correctAnswers,
        totalQuestions: quiz.questions.length,
        percentage,
        timeTaken,
        answers,
      });

      // Submit attempt
      const response = await fetch(`/api/quiz/${quizId}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: correctAnswers,
          totalQuestions: quiz.questions.length,
          percentage,
          timeTaken,
          answers,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to submit attempt:", errorText);
        throw new Error("Failed to submit quiz attempt");
      }

      const result = await response.json();
      console.log("Quiz attempt submitted successfully:", result);

      // Dispatch custom event to update points in real-time
      if (result.data?.pointsAwarded) {
        dispatchPointsUpdate({
          pointsAwarded: result.data.pointsAwarded,
          newTotal: result.data.newTotal,
          source: 'quiz'
        });
      }

      // Show success toast with points information
      if (result.data?.pointsAwarded) {
        toast.success(
          `🎉 Quiz completed! You scored ${percentage}% and earned ${result.data.pointsAwarded} points!`,
          {
            duration: 4000,
            description: `Great job! Points have been added to your account.`,
          }
        );
      } else {
        toast.success(`Quiz completed! You scored ${percentage}%`);
      }

      // Navigate to results page
      router.push(`/dashboard/quiz/${quizId}/result`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getBadgeVariant = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "secondary";
      case "medium":
        return "default";
      case "hard":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading quiz...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  {error || "The quiz you're looking for doesn't exist."}
                </p>
                <Button onClick={() => router.push("/dashboard/quiz")}>
                  Back to Quizzes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                <BookOpen className="h-4 w-4" />
                <span>{quiz.subject}</span>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">
                {quiz.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {quiz.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Subject:
                    </span>
                    <Badge variant="outline">{quiz.subject}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Grade Level:
                    </span>
                    <Badge variant="outline">
                      {quiz.academic_level || "Not specified"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Difficulty:
                    </span>
                    <Badge variant={getBadgeVariant("medium")}>Medium</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Estimated Time:
                    </span>
                    <span className="font-medium">
                      {quiz.timeLimitMinutes || quiz.questions.length * 2}{" "}
                      minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Questions:
                    </span>
                    <span className="font-medium">{quiz.questions.length}</span>
                  </div>
                </div>
              </div>

              <Alert className="mb-6">
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instructions:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Answer all {quiz.questions.length} questions</li>
                    <li>
                      You have{" "}
                      {quiz.timeLimitMinutes || quiz.questions.length * 2}{" "}
                      minutes to complete
                    </li>
                    <li>You can navigate between questions</li>
                    <li>Submit when ready or time runs out</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <Button onClick={handleStartQuiz} size="lg" className="px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion] as Question;
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with timer and progress */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="w-5 h-5" />
                  <span className={timeLeft < 300 ? "text-red-600" : ""}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Badge variant="outline">
                  {currentQuestion + 1} of {quiz.questions.length}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              Question {currentQuestion + 1}
            </CardTitle>
            <CardDescription className="text-lg">
              {currentQ.text || "Question text not available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(currentQ.kind === QuestionKind.Single || !currentQ.kind) &&
              (() => {
                const singleChoice = currentQ as SingleChoiceQuestion;
                return (
                  <div className="space-y-3">
                    {singleChoice.options?.map((option, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          answers[currentQuestion] === index
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleAnswerChange(index)}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              answers[currentQuestion] === index
                                ? "border-primary bg-primary"
                                : "border-gray-300"
                            }`}
                          >
                            {answers[currentQuestion] === index && (
                              <div className="w-full h-full rounded-full bg-white scale-50" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{option}</span>
                        </div>
                      </div>
                    )) || []}
                  </div>
                );
              })()}

            {currentQ.kind === QuestionKind.Multiple &&
              (() => {
                const multipleChoice = currentQ as MultipleChoiceQuestion;
                const currentAnswers = answers[currentQuestion] || [];

                return (
                  <div className="space-y-3">
                    {multipleChoice.options?.map((option, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          currentAnswers.includes(index)
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          const newAnswers = currentAnswers.includes(index)
                            ? currentAnswers.filter((a: number) => a !== index)
                            : [...currentAnswers, index];
                          handleAnswerChange(newAnswers);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded border-2 ${
                              currentAnswers.includes(index)
                                ? "border-primary bg-primary"
                                : "border-gray-300"
                            }`}
                          >
                            {currentAnswers.includes(index) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{option}</span>
                        </div>
                      </div>
                    )) || []}
                    <p className="text-xs text-gray-600 mt-2">
                      Select all that apply
                    </p>
                  </div>
                );
              })()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!isLastQuestion ? (
              <Button onClick={handleNextQuestion}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Submit Quiz
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnswerPage;
