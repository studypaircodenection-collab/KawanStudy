"use client";
import React from "react";
import Link from "next/link";
import { Play, Eye, Clock, Users } from "lucide-react";
import type { Quiz } from "@/types/quiz";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  quiz: Quiz;
}

const QuizCard: React.FC<Props> = ({ quiz }) => {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {quiz.title}
            </CardTitle>
            {quiz.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {quiz.description}
              </CardDescription>
            )}
          </div>
          {quiz.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={quiz.thumbnailUrl}
              alt={`${quiz.title} thumbnail`}
              className="w-16 h-16 object-cover rounded-lg border ml-3 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-muted rounded-lg border ml-3 flex-shrink-0 flex items-center justify-center">
              <Play className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {quiz.subject}
          </Badge>
          {quiz.academic_level && (
            <Badge variant="outline" className="text-xs">
              {quiz.academic_level}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{quiz.playCount ?? 0} plays</span>
          </div>
          {quiz.timeLimitMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{quiz.timeLimitMinutes} min</span>
            </div>
          )}
          <div className="text-xs">
            {quiz.questions.length} question
            {quiz.questions.length !== 1 ? "s" : ""}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/dashboard/quiz/${quiz.id}`}>
              <Play className="w-4 h-4" />
              Play Quiz
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
