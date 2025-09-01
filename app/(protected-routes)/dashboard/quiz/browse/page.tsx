"use client";
import React from "react";
import QuizCard from "@/components/quiz/quiz-card";
import type { Quiz } from "@/types/quiz";
import { QuestionKind } from "@/types/quiz";

const sampleQuizzes: Quiz[] = [
  {
    id: "math-1",
    title: "Basic Math Quiz",
    thumbnailUrl: "",
    description: "A short quiz covering addition and subtraction.",
    subject: "Math",
    gradeLevel: "3",
    playCount: 123,
    questions: [
      {
        id: "m1-q1",
        text: "What is 2 + 2?",
        options: ["1", "2", "3", "4"],
        correct: 3,
        kind: QuestionKind.Single,
      },
    ],
    timeLimitMinutes: 5,
  },
  {
    id: "sci-1",
    title: "Intro to Science",
    thumbnailUrl: "",
    description: "Basic science facts and concepts.",
    subject: "Science",
    gradeLevel: "4",
    playCount: 89,
    questions: [
      {
        id: "s1-q1",
        text: "Which of these is a planet?",
        options: ["Sun", "Moon", "Earth", "Sirius"],
        correct: 2,
        kind: QuestionKind.Single,
      },
    ],
  },
];

const page = () => {
  return (
    <main style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <h1 style={{ margin: 0 }}>Browse Quizzes</h1>
      </header>

      <section
        aria-label="Available quizzes"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {sampleQuizzes.map((q) => (
          <QuizCard key={q.id} quiz={q} />
        ))}
      </section>
    </main>
  );
};

export default page;
