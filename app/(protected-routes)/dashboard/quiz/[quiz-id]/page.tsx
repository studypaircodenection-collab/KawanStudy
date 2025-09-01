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
  ChevronRight,
  Calendar,
  User,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types
interface QuizDetailProps {
  params: {
    "quiz-id": string;
  };
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  academic_level: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  estimated_time: number;
  total_questions: number;
  thumbnail_url?: string;
  created_from_note: {
    id: string;
    title: string;
    author: string;
  };
  created_at: string;
  attempts_count: number;
  best_score?: number;
}

// Mock data
const mockQuizData: QuizData = {
  id: "quiz_123",
  title: "Advanced Calculus - Derivatives and Integration",
  description:
    "Test your understanding of calculus fundamentals including derivatives, integration, and their applications. This comprehensive quiz covers the essential concepts you need to master for your calculus studies.",
  subject: "Mathematics",
  topic: "Calculus",
  academic_level: "undergraduate",
  difficulty_level: "intermediate",
  estimated_time: 15,
  total_questions: 5,
  thumbnail_url:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop&crop=center",
  created_from_note: {
    id: "note_456",
    title: "Calculus Lecture Notes - Chapter 5",
    author: "Prof. Sarah Johnson",
  },
  created_at: "2025-01-10T14:30:00Z",
  attempts_count: 3,
  best_score: 85,
};

const QuizDetailPage: React.FC<QuizDetailProps> = ({ params }) => {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  const quizId = params["quiz-id"];

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);

      // Skip API call for now - use mock data directly
      setTimeout(() => {
        setQuizData(mockQuizData);
        setLoading(false);
      }, 800); // Simulate loading time

      // TODO: Uncomment when API is ready
      /*
      const response = await fetch(`/api/quiz/${quizId}`);
      const data = await response.json();

      if (data.success) {
        setQuizData(data.quiz);
      } else {
        console.error("Failed to load quiz data");
      }
      */
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setQuizData(mockQuizData);
    } finally {
      // Loading is handled in setTimeout above
    }
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleStartQuiz = () => {
    router.push(`/dashboard/quiz/${quizId}/answer`);
  };

  const handleViewResults = () => {
    // In a real app, you'd get the latest attempt ID
    router.push(`/dashboard/quiz/${quizId}/result?attemptId=latest`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading quiz details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Quiz Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The quiz you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/dashboard/quiz/browse")}>
                Browse Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                {quizData.thumbnail_url && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={quizData.thumbnail_url}
                      alt={`${quizData.title} thumbnail`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{quizData.subject}</Badge>
                  <Badge variant="outline">{quizData.topic}</Badge>
                  <Badge variant={getBadgeVariant(quizData.difficulty_level)}>
                    {quizData.difficulty_level}
                  </Badge>
                  <Badge variant="secondary">{quizData.academic_level}</Badge>
                </div>

                <CardTitle className="text-3xl font-bold mb-4">
                  {quizData.title}
                </CardTitle>

                <CardDescription className="text-lg leading-relaxed">
                  {quizData.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-6 w-6 text-primary mr-2" />
                      <span className="text-2xl font-bold">
                        {quizData.total_questions}
                      </span>
                    </div>
                    <p className="text-muted-foreground">Questions</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-6 w-6 text-primary mr-2" />
                      <span className="text-2xl font-bold">
                        {quizData.estimated_time}
                      </span>
                    </div>
                    <p className="text-muted-foreground">Minutes</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="h-6 w-6 text-primary mr-2" />
                      <span className="text-2xl font-bold">
                        {quizData.best_score ? `${quizData.best_score}%` : "—"}
                      </span>
                    </div>
                    <p className="text-muted-foreground">Best Score</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Source Note Information */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Source Material
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {quizData.created_from_note.title}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-1" />
                        {quizData.created_from_note.author}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        Created on {formatDate(quizData.created_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl">Ready to Start?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleStartQuiz}
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  Start Quiz
                </Button>

                {quizData.attempts_count > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleViewResults}
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Award className="h-5 w-5" />
                    View Past Results
                  </Button>
                )}

                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Tips:</strong> Make sure you have{" "}
                    {quizData.estimated_time} minutes available. The quiz will
                    auto-submit when time expires.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <span>Attempts</span>
                    </div>
                    <Badge variant="outline">{quizData.attempts_count}</Badge>
                  </div>

                  {quizData.best_score && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-primary mr-2" />
                        <span>Best Score</span>
                      </div>
                      <Badge
                        variant={
                          quizData.best_score >= 80
                            ? "default"
                            : quizData.best_score >= 60
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {quizData.best_score}%
                      </Badge>
                    </div>
                  )}

                  <Separator />

                  <div className="text-center pt-2">
                    <Button
                      variant="link"
                      className="text-sm p-0 h-auto"
                      onClick={() => router.push("/dashboard/quiz/browse")}
                    >
                      ← Back to Browse Quizzes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailPage;
