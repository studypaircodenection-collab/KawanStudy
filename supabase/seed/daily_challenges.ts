import { faker } from "@faker-js/faker";

export interface DailyChallengeSeedData {
  id: string;
  name: string;
  description: string;
  challenge_type: string;
  target_value: number;
  points_reward: number;
  is_active: boolean;
  difficulty: string;
  created_at: string;
}

const challengeTemplates = [
  // Easy challenges (10-30 points) - avoid naming conflicts with existing ones
  {
    name: "daily_study_login",
    description: "Start your day by logging into KawanStudy",
    challenge_type: "quiz",
    target_value: 1,
    points_reward: 10,
    difficulty: "easy",
  },
  {
    name: "profile_enhance",
    description: "Improve your profile with new information",
    challenge_type: "profile_update",
    target_value: 1,
    points_reward: 15,
    difficulty: "easy",
  },
  {
    name: "browse_study_notes",
    description: "Browse and view 3 study notes from peers",
    challenge_type: "quiz",
    target_value: 3,
    points_reward: 20,
    difficulty: "easy",
  },
  {
    name: "complete_daily_quiz",
    description: "Complete at least 1 quiz today",
    challenge_type: "quiz",
    target_value: 1,
    points_reward: 25,
    difficulty: "easy",
  },
  {
    name: "peer_message",
    description: "Send a helpful message to a study partner",
    challenge_type: "profile_update",
    target_value: 1,
    points_reward: 20,
    difficulty: "easy",
  },

  // Medium challenges (35-60 points)
  {
    name: "share_knowledge",
    description: "Upload and share a study note with the community",
    challenge_type: "quiz",
    target_value: 1,
    points_reward: 50,
    difficulty: "medium",
  },
  {
    name: "quiz_mastery",
    description: "Complete 3 quizzes with 80%+ score",
    challenge_type: "quiz",
    target_value: 3,
    points_reward: 60,
    difficulty: "medium",
  },
  {
    name: "community_helper",
    description: "Comment on 2 study materials to help peers",
    challenge_type: "profile_update",
    target_value: 2,
    points_reward: 40,
    difficulty: "medium",
  },
  {
    name: "focused_study",
    description: "Study for 30 minutes using platform materials",
    challenge_type: "quiz",
    target_value: 30,
    points_reward: 45,
    difficulty: "medium",
  },
  {
    name: "social_learner",
    description: "Like and comment on 5 study materials",
    challenge_type: "profile_update",
    target_value: 5,
    points_reward: 35,
    difficulty: "medium",
  },

  // Hard challenges (70-100 points)
  {
    name: "quiz_creator",
    description: "Create and publish a new quiz for peers",
    challenge_type: "quiz",
    target_value: 1,
    points_reward: 100,
    difficulty: "hard",
  },
  {
    name: "perfect_scorer",
    description: "Achieve 100% on any quiz",
    challenge_type: "quiz",
    target_value: 1,
    points_reward: 75,
    difficulty: "hard",
  },
  {
    name: "knowledge_sharer",
    description: "Upload 3 high-quality study materials in one day",
    challenge_type: "quiz",
    target_value: 3,
    points_reward: 120,
    difficulty: "hard",
  },
  {
    name: "mentor_student",
    description: "Help 5 different students with meaningful interactions",
    challenge_type: "profile_update",
    target_value: 5,
    points_reward: 90,
    difficulty: "hard",
  },
  {
    name: "quiz_marathon",
    description: "Complete 10 quizzes in a single study session",
    challenge_type: "quiz",
    target_value: 10,
    points_reward: 150,
    difficulty: "hard",
  },
];

export function generateDailyChallengeSeedData(): DailyChallengeSeedData[] {
  return challengeTemplates.map((template) => ({
    id: faker.string.uuid(),
    name: template.name,
    description: template.description,
    challenge_type: template.challenge_type,
    target_value: template.target_value,
    points_reward: template.points_reward,
    is_active: faker.helpers.maybe(() => true, { probability: 0.8 }) ?? true, // 80% active, fallback to true
    difficulty: template.difficulty,
    created_at: faker.date.past({ years: 1 }).toISOString(),
  }));
}

export function generateDailyChallengeInsertSQL(
  challenges: DailyChallengeSeedData[]
): string {
  const values = challenges
    .map((challenge) => {
      return `(
      '${challenge.id}',
      '${challenge.name}',
      '${challenge.description.replace(/'/g, "''")}',
      '${challenge.challenge_type}',
      ${challenge.target_value},
      ${challenge.points_reward},
      ${challenge.is_active},
      '${challenge.difficulty}',
      '${challenge.created_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample daily challenges
INSERT INTO public.daily_challenges (
  id, name, description, challenge_type, target_value, points_reward, 
  is_active, difficulty, created_at
) VALUES
    ${values};
`;
}
