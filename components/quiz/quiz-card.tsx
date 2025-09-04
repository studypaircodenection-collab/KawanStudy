"use client";
import React from "react";
import Link from "next/link";
import { Play, Clock, Users, BookOpen, Star } from "lucide-react";
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
    <Card className="group hover:shadow-xl transition-all duration-300 border-primary/40 hover:border-primary/60">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {quiz.title}
            </CardTitle>
            {quiz.description && (
              <CardDescription className="mt-2 line-clamp-2 text-muted-foreground group-hover:text-muted-foreground/80">
                {quiz.description}
              </CardDescription>
            )}
          </div>
          {quiz.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={quiz.thumbnailUrl}
              alt={`${quiz.title} thumbnail`}
              className="w-16 h-16 object-cover rounded-xl border-2 border-primary/20 ml-3 flex-shrink-0 group-hover:border-primary/40 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border-2 border-primary/20 ml-3 flex-shrink-0 flex items-center justify-center group-hover:border-primary/40 transition-colors">
              <BookOpen className="w-7 h-7 text-foregrounds" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge
            variant="default"
            className="text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          >
            {quiz.subject}
          </Badge>
          {quiz.academic_level && (
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-secondary/50  text-primary border-secondary"
            >
              {quiz.academic_level}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-primary">
              <Users className="w-4 h-4" />
              <span className="font-medium">{quiz.playCount ?? 0}</span>
              <span className="text-muted-foreground">plays</span>
            </div>
            {quiz.timeLimitMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">
                  {quiz.timeLimitMinutes}
                </span>
                <span className=" text-muted-foreground">min</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {quiz.questions.length}
              </span>{" "}
              question{quiz.questions.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-medium">New</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          asChild
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-[1.02]"
        >
          <Link
            href={`/dashboard/quiz/${quiz.id}`}
            className="flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            <span className="font-semibold">Start Quiz</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
