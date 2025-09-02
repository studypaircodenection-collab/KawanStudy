"use client";
import React, { useState, useEffect } from "react";
import QuizCard from "@/components/quiz/quiz-card";
import type { Quiz } from "@/types/quiz";
import { QuestionKind } from "@/types/quiz";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BrowseQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>("all");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/quiz");
      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const result = await response.json();
      console.log("Fetched quizzes:", result);
      // Transform API data to match our Quiz type
      const transformedQuizzes: Quiz[] = result.data.map((quiz: any) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || "",
        thumbnailUrl: quiz.thumbnailUrl || "",
        subject: quiz.subject,
        academic_level: quiz.academic_level || "",
        playCount: quiz.playCount || 0,
        timeLimitMinutes: quiz.timeLimitMinutes,
        shuffle: quiz.shuffle || false,
        questions: quiz.questions || [], // Questions are already transformed by API
      }));

      setQuizzes(transformedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load quizzes"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter quizzes based on search and filters
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubject === "all" || quiz.subject === selectedSubject;
    const matchesGradeLevel =
      selectedGradeLevel === "all" ||
      quiz.academic_level === selectedGradeLevel;

    return matchesSearch && matchesSubject && matchesGradeLevel;
  });

  // Get unique subjects and grade levels for filters
  const subjects = Array.from(new Set(quizzes.map((q) => q.subject))).sort();
  const gradeLevels = Array.from(
    new Set(quizzes.map((q) => q.academic_level).filter(Boolean))
  ).sort();

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

  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchQuizzes}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Browse Quizzes</h1>
        <p className="text-muted-foreground">
          Discover and take quizzes from the community
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedGradeLevel}
                onValueChange={setSelectedGradeLevel}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Academic Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {gradeLevels.map((grade) => (
                    <SelectItem key={grade} value={grade!}>
                      {grade
                        ?.replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                {searchQuery ||
                selectedSubject !== "all" ||
                selectedGradeLevel !== "all"
                  ? "No quizzes found matching your criteria."
                  : "No quizzes available yet."}
              </p>
              {(searchQuery ||
                selectedSubject !== "all" ||
                selectedGradeLevel !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject("all");
                    setSelectedGradeLevel("all");
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredQuizzes.length} quiz
              {filteredQuizzes.length !== 1 ? "es" : ""} found
            </p>
            {(searchQuery ||
              selectedSubject !== "all" ||
              selectedGradeLevel !== "all") && (
              <Badge variant="secondary">Filtered Results</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BrowseQuizzesPage;
