import { faker } from "@faker-js/faker";

export interface QuizSeedData {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  subject: string;
  academic_level?: string;
  play_count: number;
  time_limit_minutes?: number;
  shuffle_questions: boolean;
  metadata: object;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestionSeedData {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answers: number[];
  explanation?: string;
  tags: string[];
  time_limit_seconds?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttemptSeedData {
  id: string;
  quiz_id: string;
  user_id: string;
  user_answers: object;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken: number;
  started_at: string;
  completed_at: string;
  created_at: string;
}

const subjects = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Psychology",
  "History",
  "Literature",
  "Business",
  "Engineering",
  "Statistics",
  "Philosophy",
  "Sociology",
];

const academicLevels = [
  "high-school",
  "undergraduate",
  "graduate",
  "professional",
];

const quizTopics = {
  Mathematics: [
    "Calculus Fundamentals",
    "Linear Algebra Basics",
    "Statistics and Probability",
    "Discrete Mathematics",
  ],
  "Computer Science": [
    "Data Structures Quiz",
    "Algorithm Complexity",
    "Database Design Principles",
    "Object-Oriented Programming",
  ],
  Physics: [
    "Mechanics Practice",
    "Thermodynamics Concepts",
    "Electromagnetic Theory",
    "Quantum Physics Basics",
  ],
  Chemistry: [
    "Organic Chemistry Reactions",
    "Periodic Table Knowledge",
    "Chemical Bonding",
    "Acid-Base Chemistry",
  ],
  Biology: [
    "Cell Biology Essentials",
    "Genetics and Heredity",
    "Evolution Theory",
    "Ecosystem Dynamics",
  ],
};

const questionTemplates = {
  Mathematics: [
    {
      question: "What is the derivative of x²?",
      options: ["2x", "x", "2", "x²"],
      correct: [0],
      explanation: "The derivative of x² is 2x using the power rule.",
    },
    {
      question: "Which of the following is a prime number?",
      options: ["15", "21", "17", "25"],
      correct: [2],
      explanation: "17 is prime because it only has factors 1 and 17.",
    },
  ],
  "Computer Science": [
    {
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: [1],
      explanation:
        "Binary search has O(log n) time complexity as it halves the search space each iteration.",
    },
    {
      question: "Which data structure follows LIFO principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correct: [1],
      explanation: "Stack follows Last In, First Out (LIFO) principle.",
    },
  ],
};

export function generateQuizSeedData(
  userIds: string[],
  count: number = 50
): QuizSeedData[] {
  const quizzes: QuizSeedData[] = [];

  for (let i = 0; i < count; i++) {
    const subject = faker.helpers.arrayElement(subjects);
    const topics = quizTopics[subject as keyof typeof quizTopics];
    const title = topics
      ? faker.helpers.arrayElement(topics)
      : `${subject} Quiz ${i + 1}`;

    const quiz: QuizSeedData = {
      id: faker.string.uuid(),
      title,
      description: faker.lorem.sentences(2),
      thumbnail_url: faker.helpers.maybe(
        () => faker.image.url({ width: 400, height: 300 }),
        { probability: 0.4 }
      ),
      subject,
      academic_level: faker.helpers.arrayElement(academicLevels),
      play_count: faker.number.int({ min: 0, max: 500 }),
      time_limit_minutes: faker.helpers.maybe(
        () => faker.number.int({ min: 10, max: 120 }),
        { probability: 0.7 }
      ),
      shuffle_questions:
        faker.helpers.maybe(() => true, { probability: 0.6 }) ?? false,
      metadata: {
        difficulty: faker.helpers.arrayElement(["easy", "medium", "hard"]),
        tags: faker.helpers.arrayElements(
          ["practice", "exam-prep", "review", "challenging"],
          { min: 1, max: 3 }
        ),
      },
      created_by: faker.helpers.arrayElement(userIds),
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    };

    quizzes.push(quiz);
  }

  return quizzes;
}

export function generateQuizQuestionSeedData(
  quizzes: QuizSeedData[]
): QuizQuestionSeedData[] {
  const questions: QuizQuestionSeedData[] = [];

  quizzes.forEach((quiz) => {
    const questionCount = faker.number.int({ min: 5, max: 20 });
    const templates =
      questionTemplates[quiz.subject as keyof typeof questionTemplates];

    for (let i = 0; i < questionCount; i++) {
      let questionData;

      if (templates && faker.helpers.maybe(() => true, { probability: 0.3 })) {
        // Use predefined template 30% of the time
        questionData = faker.helpers.arrayElement(templates);
      } else {
        // Generate random question
        questionData = generateRandomQuestion(quiz.subject);
      }

      const question: QuizQuestionSeedData = {
        id: faker.string.uuid(),
        quiz_id: quiz.id,
        question_text: questionData.question,
        question_type: questionData.correct.length > 1 ? "multiple" : "single",
        options: questionData.options,
        correct_answers: questionData.correct,
        explanation: questionData.explanation,
        tags: faker.helpers.arrayElements(
          [quiz.subject.toLowerCase(), "practice", "quiz"],
          { min: 1, max: 3 }
        ),
        time_limit_seconds: faker.helpers.maybe(
          () => faker.number.int({ min: 30, max: 300 }),
          { probability: 0.5 }
        ),
        order_index: i + 1,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at,
      };

      questions.push(question);
    }
  });

  return questions;
}

function generateRandomQuestion(subject: string): any {
  const questionTypes = [
    () => ({
      question: `What is the main principle of ${faker.lorem.word()} in ${subject}?`,
      options: [
        faker.lorem.words(3),
        faker.lorem.words(3),
        faker.lorem.words(3),
        faker.lorem.words(3),
      ],
      correct: [faker.number.int({ min: 0, max: 3 })],
      explanation: faker.lorem.sentence(),
    }),
    () => ({
      question: `Which of the following best describes ${faker.lorem.word()}?`,
      options: [
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      ],
      correct: [faker.number.int({ min: 0, max: 3 })],
      explanation: faker.lorem.sentence(),
    }),
    () => ({
      question: `True or False: ${faker.lorem.sentence()}`,
      options: ["True", "False"],
      correct: [faker.number.int({ min: 0, max: 1 })],
      explanation: faker.lorem.sentence(),
    }),
  ];

  return faker.helpers.arrayElement(questionTypes)();
}

export function generateQuizAttemptSeedData(
  quizzes: QuizSeedData[],
  questions: QuizQuestionSeedData[],
  userIds: string[],
  attemptsPerQuiz: number = 10
): QuizAttemptSeedData[] {
  const attempts: QuizAttemptSeedData[] = [];

  quizzes.forEach((quiz) => {
    const quizQuestions = questions.filter((q) => q.quiz_id === quiz.id);
    const attemptCount = faker.number.int({ min: 1, max: attemptsPerQuiz });

    for (let i = 0; i < attemptCount; i++) {
      const user = faker.helpers.arrayElement(userIds);
      const startTime = faker.date.between({
        from: new Date(quiz.created_at),
        to: new Date(),
      });

      // Generate user answers
      const userAnswers: Record<string, number[]> = {};
      let correctCount = 0;

      quizQuestions.forEach((question) => {
        // Simulate user performance (70% chance to get it right)
        const isCorrect = faker.helpers.maybe(() => true, { probability: 0.7 });

        if (isCorrect) {
          userAnswers[question.id] = question.correct_answers;
          correctCount++;
        } else {
          // Pick a random wrong answer
          const wrongAnswer = faker.number.int({
            min: 0,
            max: question.options.length - 1,
          });
          userAnswers[question.id] = [wrongAnswer];
        }
      });

      const totalQuestions = quizQuestions.length;
      const score = correctCount;
      const percentage =
        totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
      const timeTaken = faker.number.int({
        min: 60,
        max: quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : 3600,
      });
      const completedTime = new Date(startTime.getTime() + timeTaken * 1000);

      const attempt: QuizAttemptSeedData = {
        id: faker.string.uuid(),
        quiz_id: quiz.id,
        user_id: user,
        user_answers: userAnswers,
        score,
        total_questions: totalQuestions,
        percentage: Math.round(percentage * 100) / 100,
        time_taken: timeTaken,
        started_at: startTime.toISOString(),
        completed_at: completedTime.toISOString(),
        created_at: completedTime.toISOString(),
      };

      attempts.push(attempt);
    }
  });

  return attempts;
}

export function generateQuizInsertSQL(quizzes: QuizSeedData[]): string {
  if (quizzes.length === 0) {
    return "-- No quizzes to insert\n";
  }

  const values = quizzes
    .map((quiz) => {
      return `(
      '${quiz.id}',
      '${quiz.title.replace(/'/g, "''")}',
      ${
        quiz.description ? `'${quiz.description.replace(/'/g, "''")}'` : "NULL"
      },
      ${quiz.thumbnail_url ? `'${quiz.thumbnail_url}'` : "NULL"},
      '${quiz.subject}',
      ${quiz.academic_level ? `'${quiz.academic_level}'` : "NULL"},
      ${quiz.play_count},
      ${quiz.time_limit_minutes || "NULL"},
      ${quiz.shuffle_questions},
      '${JSON.stringify(quiz.metadata).replace(/'/g, "''")}',
      '${quiz.created_by}',
      '${quiz.created_at}',
      '${quiz.updated_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample quizzes
INSERT INTO public.quizzes (
  id, title, description, thumbnail_url, subject, academic_level, play_count, 
  time_limit_minutes, shuffle_questions, metadata, created_by, created_at, updated_at
) VALUES
    ${values};
`;
}

export function generateQuizQuestionInsertSQL(
  questions: QuizQuestionSeedData[]
): string {
  if (questions.length === 0) {
    return "-- No quiz questions to insert\n";
  }

  const values = questions
    .map((question) => {
      return `(
      '${question.id}',
      '${question.quiz_id}',
      '${question.question_text.replace(/'/g, "''")}',
      '${question.question_type}',
      '${JSON.stringify(question.options).replace(/'/g, "''")}',
      '${JSON.stringify(question.correct_answers).replace(/'/g, "''")}',
      ${
        question.explanation
          ? `'${question.explanation.replace(/'/g, "''")}'`
          : "NULL"
      },
      ARRAY[${question.tags.map((tag) => `'${tag}'`).join(", ")}],
      ${question.time_limit_seconds || "NULL"},
      ${question.order_index},
      '${question.created_at}',
      '${question.updated_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample quiz questions
INSERT INTO public.quiz_questions (
  id, quiz_id, question_text, question_type, options, correct_answers, 
  explanation, tags, time_limit_seconds, order_index, created_at, updated_at
) VALUES
    ${values};
`;
}

export function generateQuizAttemptInsertSQL(
  attempts: QuizAttemptSeedData[]
): string {
  if (attempts.length === 0) {
    return "-- No quiz attempts to insert\n";
  }

  const values = attempts
    .map((attempt) => {
      return `(
      '${attempt.id}',
      '${attempt.quiz_id}',
      '${attempt.user_id}',
      '${JSON.stringify(attempt.user_answers).replace(/'/g, "''")}',
      ${attempt.score},
      ${attempt.total_questions},
      ${attempt.percentage},
      ${attempt.time_taken},
      '${attempt.started_at}',
      '${attempt.completed_at}',
      '${attempt.created_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample quiz attempts
INSERT INTO public.quiz_attempts (
  id, quiz_id, user_id, user_answers, score, total_questions, percentage, 
  time_taken, started_at, completed_at, created_at
) VALUES
    ${values};
`;
}
