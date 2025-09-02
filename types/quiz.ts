export enum QuestionKind {
  Single = "single",
  Multiple = "multiple",
}

export interface Quiz {
  id: string;
  title: string;
  thumbnailUrl?: string;
  description?: string;
  subject: string;
  academic_level?: "high-school" | "undergraduate" | "graduate" | "professional";
  playCount: number;
  questions: Question[];
  timeLimitMinutes?: number; // in minutes, optional
  shuffle?: boolean;
  metadata?: Record<string, string | number | boolean>;
}

/* Question shape improvements:
   - discriminated union for single vs multiple choice
   - optional explanation, tags, per-question time limit
*/

interface QuestionBase {
  id: string;
  text: string;
  options: string[];
  explanation?: string;
  tags?: string[];
  timeLimitSeconds?: number;
  kind?: QuestionKind; // default to single when omitted
}

export interface SingleChoiceQuestion extends QuestionBase {
  kind?: QuestionKind.Single;
  correct?: number; // index of correct option
}

export interface MultipleChoiceQuestion extends QuestionBase {
  kind: QuestionKind.Multiple;
  correct?: number[]; // indices of correct options
  minSelections?: number;
  maxSelections?: number;
}

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion;

/* Answers:
   - discriminated unions mirror QuestionKind to avoid ambiguity
*/

export type SingleAnswer = number | null;
export type MultipleAnswer = number[] | null;

export type AnswerSingle = { kind: QuestionKind.Single; value: SingleAnswer };
export type AnswerMultiple = {
  kind: QuestionKind.Multiple;
  value: MultipleAnswer;
};
export type Answer = AnswerSingle | AnswerMultiple;

export type AnswerMap = Record<string, Answer | null>;

/* Progress & results */
export interface QuizProgress {
  currentIndex: number;
  answers: AnswerMap;
  completed: boolean;
  startedAt?: string; // ISO timestamp
  finishedAt?: string; // ISO timestamp
  lastSavedAt?: string; // ISO timestamp
}

export type PerQuestionResult = {
  correct: boolean;
  selected: Answer | null;
  correctAnswer?: AnswerSingle | AnswerMultiple;
  points?: number;
  explanation?: string;
};

export interface QuizResult {
  score: number;
  total: number;
  timeTaken?: number; // in seconds
  perQuestion?: Record<string, PerQuestionResult>;
}

/* Quiz attempts tracking */
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  userAnswers: Record<number, number>;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number; // in seconds
  startedAt: string; // ISO timestamp
  completedAt: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface QuizAttemptSummary {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  completedAt: string;
  rank?: number; // best, second best, etc.
}

export interface QuizAttemptsData {
  quiz: {
    id: string;
    title: string;
    description: string;
    subject: string;
    topic: string;
    difficulty_level: string;
    totalQuestions: number;
  };
  attempts: QuizAttemptSummary[];
  bestAttempt?: QuizAttemptSummary;
  totalAttempts: number;
}

export const isMultipleQuestion = (q: Question): q is MultipleChoiceQuestion =>
  q.kind === QuestionKind.Multiple;

export const isSingleQuestion = (q: Question): q is SingleChoiceQuestion =>
  q.kind === QuestionKind.Single || q.kind === undefined; // treat omitted as single

// Academic level options for quizzes
export const ACADEMIC_LEVELS = [
  { value: "high-school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "professional", label: "Professional" },
] as const;

export const createEmptyAnswerMap = (quiz: Quiz): AnswerMap =>
  quiz.questions.reduce((acc, q) => {
    if (isMultipleQuestion(q)) {
      acc[q.id] = { kind: QuestionKind.Multiple, value: null };
    } else {
      acc[q.id] = { kind: QuestionKind.Single, value: null };
    }
    return acc;
  }, {} as AnswerMap);

export const createEmptyProgress = (quiz: Quiz): QuizProgress => ({
  currentIndex: 0,
  answers: createEmptyAnswerMap(quiz),
  completed: false,
  startedAt: new Date().toISOString(),
  lastSavedAt: new Date().toISOString(),
});
