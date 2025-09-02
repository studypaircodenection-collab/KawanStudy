# KawanStudy Quiz System

A comprehensive quiz creation, management, and assessment system designed for educational collaboration and learning verification.

## 📚 Overview

The KawanStudy Quiz System allows users to create, share, take, and analyze educational quizzes. It supports multiple question types, time limits, progress tracking, and detailed analytics to enhance the learning experience.

## 🚀 Features

### Core Functionality

- ✅ **Quiz Creation**: Interactive quiz builder with multiple question types
- ✅ **Question Types**: Single choice and multiple choice questions
- ✅ **Time Management**: Per-quiz and per-question time limits
- ✅ **Progress Tracking**: Save and resume quiz attempts
- ✅ **Detailed Analytics**: Performance metrics and attempt history
- ✅ **Content Management**: Edit, duplicate, and delete quizzes
- ✅ **Browse & Discovery**: Search and filter public quizzes

### Advanced Features

- 🎯 **Academic Categorization**: Subject-based organization
- 🏆 **Performance Metrics**: Scoring, percentages, and rankings
- 🔄 **Question Shuffling**: Randomize question order
- 📊 **Attempt History**: Track multiple attempts with improvements
- 🎨 **Rich Content**: Support for explanations and tags
- 🔒 **Access Control**: Public and private quiz visibility

## 📁 System Architecture

### Database Schema

#### Core Tables

```sql
-- Main quiz metadata
quizzes (
  id, title, description, subject, academic_level,
  created_by, time_limit, shuffle_questions,
  thumbnail_url, metadata, created_at, updated_at
)

-- Individual questions
quiz_questions (
  id, quiz_id, question_text, question_type,
  options, correct_answers, explanation,
  tags, time_limit, order_index
)

-- Student attempts
quiz_attempts (
  id, quiz_id, user_id, user_answers,
  score, total_questions, percentage,
  time_taken, started_at, completed_at
)
```

### File Structure

```
├── app/(protected-routes)/dashboard/quiz/
│   ├── page.tsx                 # Quiz dashboard/overview
│   ├── browse/page.tsx          # Browse public quizzes
│   ├── create/page.tsx          # Create new quiz
│   └── [quiz-id]/
│       ├── page.tsx             # Quiz details/preview
│       ├── answer/page.tsx      # Take quiz interface
│       ├── edit/page.tsx        # Edit quiz
│       └── result/page.tsx      # View results
├── app/api/quiz/
│   ├── route.ts                 # List/create quizzes
│   └── [id]/
│       ├── route.ts             # Get/update/delete quiz
│       ├── submit/route.ts      # Submit quiz answers
│       └── attempts/
│           ├── route.ts         # List attempts
│           └── [attemptId]/route.ts # Get specific attempt
├── components/quiz/
│   └── quiz-card.tsx           # Quiz display component
├── lib/services/quiz.ts        # Quiz API client
└── types/quiz.ts              # TypeScript definitions
```

## 🛠️ API Reference

### Quiz Management

#### Create Quiz

```typescript
POST /api/quiz
{
  title: string;
  description?: string;
  subject: string;
  academic_level?: "high-school" | "undergraduate" | "graduate" | "professional";
  timeLimitMinutes?: number;
  shuffle?: boolean;
  questions: QuestionData[];
}
```

#### Get Quiz

```typescript
GET /api/quiz/[id]
Response: {
  success: boolean;
  data: Quiz & {
    createdBy?: any;
    isOwner?: boolean;
    attemptsCount?: number;
    bestScore?: number;
  };
}
```

#### Update Quiz

```typescript
PUT / api / quiz / [id];
// Same body as create
```

#### Delete Quiz

```typescript
DELETE / api / quiz / [id];
```

### Quiz Taking

#### Submit Answers

```typescript
POST / api / quiz / [id] / submit;
{
  answers: Record<string, Answer>;
  timeTaken: number;
}
```

#### Get Attempts

```typescript
GET /api/quiz/[id]/attempts
Response: {
  quiz: QuizInfo;
  attempts: QuizAttemptSummary[];
  bestAttempt?: QuizAttemptSummary;
  totalAttempts: number;
}
```

## 📝 Question Types

### Single Choice Questions

```typescript
{
  kind: "single",
  text: "What is the capital of Malaysia?",
  options: ["Kuala Lumpur", "Penang", "Johor Bahru", "Ipoh"],
  correct: 0, // Index of correct answer
  explanation?: "Kuala Lumpur is the federal capital of Malaysia.",
  timeLimitSeconds?: 30
}
```

### Multiple Choice Questions

```typescript
{
  kind: "multiple",
  text: "Which of these are programming languages?",
  options: ["JavaScript", "HTML", "Python", "CSS"],
  correct: [0, 2], // Indices of correct answers
  minSelections?: 1,
  maxSelections?: 4,
  explanation?: "JavaScript and Python are programming languages.",
  timeLimitSeconds?: 45
}
```

## 🎯 Usage Examples

### Creating a Quiz

```typescript
import { quizService } from "@/lib/services/quiz";

const quizData = {
  title: "Introduction to Computer Science",
  description: "Basic concepts and terminology",
  subject: "Computer Science",
  academic_level: "undergraduate",
  timeLimitMinutes: 30,
  questions: [
    {
      id: "q1",
      text: "What does CPU stand for?",
      options: [
        "Central Processing Unit",
        "Computer Processing Unit",
        "Central Program Unit",
        "Computer Program Unit",
      ],
      correct: 0,
      kind: "single",
    },
  ],
};

const result = await quizService.createQuiz(quizData);
```

### Taking a Quiz

```typescript
import { quizService } from "@/lib/services/quiz";

// Get quiz
const quiz = await quizService.getQuiz(quizId);

// Submit answers
const answers = {
  q1: { kind: "single", value: 0 },
  q2: { kind: "multiple", value: [0, 2] },
};

const result = await quizService.submitQuiz(quizId, answers, timeTaken);
```

### Browsing Quizzes

```typescript
import { quizService } from "@/lib/services/quiz";

const quizzes = await quizService.getQuizzes({
  subject: "Mathematics",
  academic_level: "undergraduate",
  page: 1,
  limit: 10,
});
```

## 📊 Analytics & Tracking

### Performance Metrics

- **Score**: Correct answers out of total questions
- **Percentage**: Score as a percentage
- **Time Taken**: Total time to complete quiz
- **Attempt Ranking**: Best, second-best attempts, etc.
- **Question Analysis**: Per-question performance

### Progress Tracking

```typescript
interface QuizProgress {
  currentIndex: number;
  answers: AnswerMap;
  completed: boolean;
  startedAt?: string;
  finishedAt?: string;
  lastSavedAt?: string;
}
```

## 🔧 Configuration

### Academic Levels

```typescript
const ACADEMIC_LEVELS = [
  { value: "high-school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "professional", label: "Professional" },
];
```

### Question Timing

- **Quiz-level**: Overall time limit for entire quiz
- **Question-level**: Individual question time limits
- **Auto-save**: Progress saved every 30 seconds

## 🎨 UI Components

### Quiz Card

```tsx
<QuizCard
  quiz={quiz}
  showAttempts={true}
  showCreator={true}
  onTakeQuiz={(id) => router.push(`/quiz/${id}/answer`)}
  onEditQuiz={(id) => router.push(`/quiz/${id}/edit`)}
/>
```

### Quiz Builder

- Drag-and-drop question ordering
- Real-time preview
- Validation and error handling
- Auto-save drafts

## 🔒 Security & Permissions

### Access Control

- **Public Quizzes**: Viewable by all users
- **Private Quizzes**: Only accessible by creator
- **Edit Permissions**: Only quiz creator can modify
- **Attempt Privacy**: User's attempts are private

### Data Validation

- Input sanitization for quiz content
- Answer validation on submission
- Time limit enforcement
- Duplicate attempt prevention

## 🚦 Error Handling

### Common Error Types

```typescript
// Quiz not found
{ error: "Quiz not found", code: 404 }

// Unauthorized access
{ error: "Unauthorized", code: 401 }

// Invalid submission
{ error: "Invalid quiz submission", code: 400 }

// Time limit exceeded
{ error: "Time limit exceeded", code: 408 }
```

## 📈 Performance Optimization

### Caching Strategy

- Quiz metadata cached for 5 minutes
- Question data cached until quiz updated
- User attempts cached for session duration

### Database Optimization

- Indexed on quiz subject and creator
- Paginated quiz listings
- Optimized question queries

## 🧪 Testing

### Test Data

The system includes comprehensive seed data:

- **10 sample quizzes** across various subjects
- **130+ questions** with different difficulty levels
- **20+ quiz attempts** with realistic scores
- **Malaysian academic context** for localization

### Test Scenarios

- Quiz creation and validation
- Question type handling
- Time limit enforcement
- Progress save/resume
- Analytics calculation

## 🔮 Future Enhancements

### Planned Features

- 📱 **Mobile App**: React Native implementation
- 🤖 **AI Integration**: Auto-generated questions
- 📊 **Advanced Analytics**: Learning pattern analysis
- 🎮 **Gamification**: Badges and leaderboards
- 🔄 **Import/Export**: Quiz sharing between platforms
- 👥 **Collaborative Quizzes**: Team-based quiz creation

### Technical Improvements

- Real-time collaboration on quiz creation
- Offline quiz taking capability
- Advanced question types (drag-drop, matching)
- Detailed learning path recommendations

## 📞 Support

### Getting Help

- Check the [API documentation](../api/quiz/README.md)
- Review the [component library](../components/quiz/README.md)
- Submit issues via GitHub
- Contact the development team

### Contributing

- Follow the existing code patterns
- Add tests for new features
- Update documentation
- Submit pull requests with clear descriptions

---

**Last Updated**: September 2025  
**Version**: 1.0.0  
**Maintainer**: KawanStudy Development Team
