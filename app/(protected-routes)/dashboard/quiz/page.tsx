"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Award, Plus, Loader2 } from "lucide-react";
import { QuizService } from "@/lib/services/quiz";
import { Quiz, QuestionKind } from "@/types/quiz";

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await QuizService.getQuizzes({ limit: 20 });
      setQuizzes(response.data);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
      setError(err instanceof Error ? err.message : "Failed to load quizzes");
      // Fallback to mock data
      setQuizzes(mockQuizzes);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge and track your progress
          </p>
          {error && (
            <p className="text-sm text-destructive mt-1">
              {error} - Showing fallback data
            </p>
          )}
        </div>
        <Link href="/dashboard/quiz/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="outline">{quiz.subject}</Badge>
                  {quiz.gradeLevel && (
                    <Badge variant="secondary">Grade {quiz.gradeLevel}</Badge>
                  )}
                </div>
                {quiz.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={quiz.thumbnailUrl}
                    alt={quiz.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
              </div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {quiz.description}
                </p>
              )}
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {quiz.timeLimitMinutes || 15} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {quiz.questions.length} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {quiz.playCount} plays
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/quiz/${quiz.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      View Quiz
                    </Button>
                  </Link>
                  <Link href={`/dashboard/quiz/${quiz.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first quiz!
          </p>
          <Link href="/dashboard/quiz/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// Fallback mock data
const mockQuizzes: Quiz[] = [
  {
    id: "quiz_123",
    title: "Advanced Calculus - Derivatives and Integration",
    description:
      "Test your understanding of calculus fundamentals including derivatives, integration, and their applications.",
    subject: "Mathematics",
    gradeLevel: "12",
    playCount: 42,
    questions: [
      {
        id: "q1",
        text: "What is the derivative of x²?",
        options: ["x", "2x", "x²", "2"],
        correct: 1,
        kind: QuestionKind.Single,
      },
    ],
    timeLimitMinutes: 15,
    shuffle: false,
  },
];
