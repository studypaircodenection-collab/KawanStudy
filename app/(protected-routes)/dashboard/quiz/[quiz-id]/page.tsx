"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  BookOpen,
  Target,
  Award,
  Play,
  Edit,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Quiz } from "@/types/quiz";

interface QuizDetailProps {
  params: Promise<{
    "quiz-id": string;
  }>;
}

const QuizDetailPage: React.FC<QuizDetailProps> = ({ params }) => {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const resolvedParams = React.use(params);
  const quizId = resolvedParams["quiz-id"];

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching quiz with ID:", quizId);
      const response = await fetch(`/api/quiz/${quizId}`);
      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(
          `Failed to fetch quiz: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("API Result:", result);
      setQuiz(result.data);

      // Check if current user is the owner
      setIsOwner(result.data.isOwner || false);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setError(error instanceof Error ? error.message : "Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    router.push(`/dashboard/quiz/${quizId}/answer`);
  };

  const handleEditQuiz = () => {
    router.push(`/dashboard/quiz/${quizId}/edit`);
  };

  const handleViewResults = () => {
    router.push(`/dashboard/quiz/${quizId}/result`);
  };

  const handleBackToQuizzes = () => {
    router.push("/dashboard/quiz");
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
                <Button onClick={handleBackToQuizzes}>Back to Quizzes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <BookOpen className="h-4 w-4" />
            <span>{quiz.subject}</span>
            {quiz.academic_level && (
              <>
                <span>•</span>
                <span>{quiz.academic_level}</span>
              </>
            )}
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-muted-foreground text-lg">
                  {quiz.description}
                </p>
              )}
            </div>
            {isOwner && (
              <Button onClick={handleEditQuiz} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Quiz
              </Button>
            )}
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Questions
                  </p>
                  <p className="text-2xl font-bold">{quiz.questions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Est. Time
                  </p>
                  <p className="text-2xl font-bold">
                    {quiz.timeLimitMinutes || quiz.questions.length * 2}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Play Count
                  </p>
                  <p className="text-2xl font-bold">{quiz.playCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Difficulty
                  </p>
                  <Badge variant={getBadgeVariant("medium")} className="mt-1">
                    Medium
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Description Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About This Quiz</CardTitle>
            <CardDescription>
              Test your knowledge with this comprehensive quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Subject:</span>
                <Badge variant="outline">{quiz.subject}</Badge>
              </div>
              {quiz.academic_level && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Grade Level:</span>
                  <Badge variant="outline">{quiz.academic_level}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-medium">Questions:</span>
                <span>{quiz.questions.length} questions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Estimated Time:</span>
                <span>
                  {quiz.timeLimitMinutes || quiz.questions.length * 2} minutes
                </span>
              </div>
              {quiz.shuffle && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Question Order:</span>
                  <span>Randomized</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Read each question carefully before selecting your answer
                  </li>
                  <li>You can navigate between questions during the quiz</li>
                  <li>
                    Make sure to submit your quiz when you&aspos;re finished
                  </li>
                  <li>
                    You can retake this quiz as many times as you&aspos;d like
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        {/* Sample Questions Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sample Questions</CardTitle>
            <CardDescription>
              Here&aspos;s a preview of what you&aspos;ll find in this quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quiz.questions.length > 0 ? (
              <div className="space-y-4">
                {quiz.questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">
                          {index + 1}. {question.text || "Sample question"}
                        </h4>
                        {question.options && question.options.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {question.options.length} answer choices
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {question.kind || "Single Choice"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {quiz.questions.length > 3 && (
                  <div className="text-center pt-4">
                    <p className="text-gray-600">
                      + {quiz.questions.length - 3} more questions
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No questions available for preview
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Action Buttons */}
        <div className="flex flex-col mt-4 sm:flex-row gap-4 justify-center">
          <Button onClick={handleStartQuiz} size="lg" className="px-8">
            <Play className="w-5 h-5 mr-2" />
            Start Quiz
          </Button>
          <Button onClick={handleViewResults} variant="outline" size="lg">
            <Award className="w-5 h-5 mr-2" />
            View Results
          </Button>
          <Button onClick={handleBackToQuizzes} variant="outline" size="lg">
            <BookOpen className="w-5 h-5 mr-2" />
            Browse Quizzes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailPage;
