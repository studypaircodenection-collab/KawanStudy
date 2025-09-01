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

// Types
interface Question {
  id: number;
  question: string;
  type: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  academic_level: string;
  difficulty_level: string;
  estimated_time: number;
  total_questions: number;
  created_from_note: {
    id: string;
    title: string;
    author: string;
  };
}

interface SelectedAnswers {
  [key: number]: number;
}

interface QuizAnswerProps {
  params: {
    "quiz-id": string;
  };
}

// Mock data - in real app, this would come from props or API
const mockQuizData: QuizData = {
  id: "quiz_123",
  title: "Advanced Calculus - Derivatives and Integration",
  description:
    "Test your understanding of calculus fundamentals including derivatives, integration, and their applications",
  subject: "Mathematics",
  topic: "Calculus",
  academic_level: "undergraduate",
  difficulty_level: "intermediate",
  estimated_time: 15,
  total_questions: 5,
  created_from_note: {
    id: "note_456",
    title: "Calculus Lecture Notes - Chapter 5",
    author: "Prof. Sarah Johnson",
  },
};

const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is the derivative of f(x) = 3x² + 2x - 1?",
    type: "multiple-choice",
    options: ["6x + 2", "6x² + 2x", "3x + 2", "6x - 1"],
    correct_answer: 0,
    explanation:
      "Using the power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-1) = 0. Therefore, f'(x) = 6x + 2.",
  },
  {
    id: 2,
    question: "∫(2x + 3)dx = ?",
    type: "multiple-choice",
    options: ["x² + 3x + C", "2x² + 3x + C", "x² + 3x", "2x + 3x + C"],
    correct_answer: 0,
    explanation: "∫2x dx = x² and ∫3 dx = 3x, so ∫(2x + 3)dx = x² + 3x + C",
  },
  {
    id: 3,
    question: "If f(x) = e^x, what is f'(x)?",
    type: "multiple-choice",
    options: ["e^x", "xe^x", "e^(x-1)", "1"],
    correct_answer: 0,
    explanation:
      "The derivative of e^x is e^x itself. This is a fundamental property of the exponential function.",
  },
  {
    id: 4,
    question: "What is the chain rule formula?",
    type: "multiple-choice",
    options: [
      "(f ∘ g)'(x) = f'(g(x)) · g'(x)",
      "(f ∘ g)'(x) = f'(x) · g'(x)",
      "(f ∘ g)'(x) = f(g'(x))",
      "(f ∘ g)'(x) = f'(x) + g'(x)",
    ],
    correct_answer: 0,
    explanation:
      "The chain rule states that the derivative of a composite function is the derivative of the outer function times the derivative of the inner function.",
  },
  {
    id: 5,
    question: "Find the critical points of f(x) = x³ - 3x² + 2",
    type: "multiple-choice",
    options: ["x = 0, x = 2", "x = 1, x = 3", "x = -1, x = 2", "x = 0, x = 3"],
    correct_answer: 0,
    explanation:
      "Critical points occur where f'(x) = 0. f'(x) = 3x² - 6x = 3x(x - 2) = 0, so x = 0 or x = 2.",
  },
];

const QuizAnswerPage: React.FC<QuizAnswerProps> = ({ params }) => {
  const router = useRouter();
  const quizId = params["quiz-id"];
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(
    mockQuizData.estimated_time * 60
  );
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && quizStarted) {
      handleSubmitQuiz();
    }
  }, [quizStarted, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmitQuiz = async () => {
    const quizResults = {
      quiz_id: mockQuizData.id,
      user_answers: selectedAnswers,
      time_taken: mockQuizData.estimated_time * 60 - timeLeft,
      completed_at: new Date().toISOString(),
    };

    try {
      // API call to submit quiz results
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizResults),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to results page with attempt ID
        router.push(`/quiz/${quizId}/result`);
      } else {
        console.error("Failed to submit quiz:", data.error);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const getBadgeVariant = (level: string) => {
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

  // Quiz Introduction Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="h-12 w-12 text-primary mr-3" />
                <CardTitle className="text-3xl font-bold">Quiz Time!</CardTitle>
              </div>
              <CardTitle className="text-2xl text-muted-foreground mb-2">
                {mockQuizData.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {mockQuizData.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quiz Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-primary mr-3" />
                        <span>Subject</span>
                      </div>
                      <Badge variant="outline">{mockQuizData.subject}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-primary mr-3" />
                        <span>Topic</span>
                      </div>
                      <Badge variant="outline">{mockQuizData.topic}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-primary mr-3" />
                        <span>Level</span>
                      </div>
                      <Badge
                        variant={getBadgeVariant(mockQuizData.difficulty_level)}
                      >
                        {mockQuizData.difficulty_level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-primary mr-3" />
                        <span>Time Limit</span>
                      </div>
                      <Badge variant="secondary">
                        {mockQuizData.estimated_time} minutes
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>
                        • Answer all {mockQuizData.total_questions} questions
                      </li>
                      <li>• You can navigate between questions</li>
                      <li>• Timer starts when you begin</li>
                      <li>• Submit before time runs out</li>
                      <li>• Review explanations after completion</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={() => setQuizStarted(true)}
                  size="lg"
                  className="px-8 py-6 text-lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz Interface
  const currentQ = mockQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{mockQuizData.title}</CardTitle>
              <Badge variant="destructive" className="px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(timeLeft)}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
              <span>
                Question {currentQuestion + 1} of {mockQuestions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>

            <Progress value={progress} className="mt-2" />
          </CardHeader>
        </Card>

        {/* Question */}
        <Card className="shadow-lg border-0">
          <CardContent className="pt-8">
            <CardTitle className="text-xl mb-6 leading-relaxed">
              {currentQ.question}
            </CardTitle>

            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    selectedAnswers[currentQuestion] === index
                      ? "default"
                      : "outline"
                  }
                  className={`w-full justify-start text-left p-6 h-auto ${
                    selectedAnswers[currentQuestion] === index
                      ? "border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center">
                    <Badge
                      variant={
                        selectedAnswers[currentQuestion] === index
                          ? "secondary"
                          : "outline"
                      }
                      className="mr-4 w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      {String.fromCharCode(65 + index)}
                    </Badge>
                    <span className="text-left">{option}</span>
                  </div>
                </Button>
              ))}
            </div>

            {selectedAnswers[currentQuestion] !== undefined &&
              !showExplanation && (
                <div className="mb-6">
                  <Button
                    variant="link"
                    onClick={() => setShowExplanation(true)}
                    className="p-0 h-auto"
                  >
                    Show explanation
                  </Button>
                </div>
              )}

            {showExplanation && (
              <Alert className="mb-6">
                <AlertDescription>
                  <strong>Explanation:</strong> {currentQ.explanation}
                </AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-3">
                {currentQuestion === mockQuestions.length - 1 ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizAnswerPage;

// API Integration Types
export interface QuizSubmissionPayload {
  quiz_id: string;
  user_answers: Record<number, number>;
  time_taken: number;
  completed_at: string;
}

export interface QuizSubmissionResponse {
  success: boolean;
  attempt_id?: string;
  error?: string;
}

// Usage in Next.js page:
// pages/quiz/[quizId]/answer.tsx
// export default function QuizAnswer() {
//   const router = useRouter();
//   const { quizId } = router.query;
//   return <QuizAnswerPage quizId={quizId as string} />;
// }
