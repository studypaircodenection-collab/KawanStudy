import { faker } from "@faker-js/faker";

export interface AchievementSeedData {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  points_required: number;
  condition_type: string;
  condition_value: number;
  condition_meta?: object;
  is_active: boolean;
  rarity: string;
  created_at: string;
}

const achievementTemplates = [
  // Common achievements (0-500 points)
  {
    name: "first_login",
    title: "Welcome Aboard!",
    description: "Log in to KawanStudy for the first time",
    icon: "🎉",
    points_required: 0,
    rarity: "common",
  },
  {
    name: "profile_complete",
    title: "Profile Master",
    description: "Complete your profile with all required information",
    icon: "✅",
    points_required: 50,
    rarity: "common",
  },
  {
    name: "first_note_upload",
    title: "Knowledge Sharer",
    description: "Upload your first note to help others",
    icon: "📚",
    points_required: 100,
    rarity: "common",
  },
  {
    name: "rookie",
    title: "Rookie",
    description: "Earn your first 100 points",
    icon: "🌟",
    points_required: 100,
    rarity: "common",
  },
  {
    name: "social_starter",
    title: "Social Starter",
    description: "Send your first message to a study partner",
    icon: "💬",
    points_required: 50,
    rarity: "common",
  },

  // Rare achievements (500-1000 points)
  {
    name: "note_enthusiast",
    title: "Note Enthusiast",
    description: "Upload 10 notes to share knowledge",
    icon: "📖",
    points_required: 500,
    rarity: "rare",
  },
  {
    name: "quiz_creator",
    title: "Quiz Creator",
    description: "Create your first quiz",
    icon: "❓",
    points_required: 200,
    rarity: "rare",
  },
  {
    name: "helpful_student",
    title: "Helpful Student",
    description: "Get 50 downloads on your notes",
    icon: "🤝",
    points_required: 750,
    rarity: "rare",
  },
  {
    name: "daily_warrior",
    title: "Daily Warrior",
    description: "Complete daily challenges for 7 days in a row",
    icon: "⚡",
    points_required: 350,
    rarity: "rare",
  },
  {
    name: "social_butterfly",
    title: "Social Butterfly",
    description: "Connect with 5 study partners",
    icon: "🦋",
    points_required: 400,
    rarity: "rare",
  },

  // Epic achievements (1000-5000 points)
  {
    name: "knowledge_master",
    title: "Knowledge Master",
    description: "Upload 50 notes across different subjects",
    icon: "🎓",
    points_required: 2500,
    rarity: "epic",
  },
  {
    name: "quiz_champion",
    title: "Quiz Champion",
    description: "Create 20 quizzes and get high engagement",
    icon: "🏆",
    points_required: 2000,
    rarity: "epic",
  },
  {
    name: "community_leader",
    title: "Community Leader",
    description: "Help 100 students with your content",
    icon: "👑",
    points_required: 3000,
    rarity: "epic",
  },
  {
    name: "study_mentor",
    title: "Study Mentor",
    description: "Maintain a perfect helping streak for 30 days",
    icon: "🌟",
    points_required: 1500,
    rarity: "epic",
  },
  {
    name: "note_curator",
    title: "Note Curator",
    description: "Have your notes downloaded 1000 times",
    icon: "📋",
    points_required: 4000,
    rarity: "epic",
  },

  // Legendary achievements (5000+ points)
  {
    name: "study_legend",
    title: "Study Legend",
    description: "Reach 10,000 total points through consistent contribution",
    icon: "👑",
    points_required: 10000,
    rarity: "legendary",
  },
  {
    name: "knowledge_sage",
    title: "Knowledge Sage",
    description: "Upload 100 high-quality notes and maintain 95% rating",
    icon: "🧙‍♂️",
    points_required: 7500,
    rarity: "legendary",
  },
  {
    name: "quiz_deity",
    title: "Quiz Deity",
    description: "Create 100 quizzes with perfect engagement scores",
    icon: "⚡",
    points_required: 8000,
    rarity: "legendary",
  },
  {
    name: "community_pillar",
    title: "Community Pillar",
    description: "Help 1000 students and maintain top contributor status",
    icon: "🏛️",
    points_required: 15000,
    rarity: "legendary",
  },
];

export function generateAchievementSeedData(): AchievementSeedData[] {
  return achievementTemplates.map((template) => ({
    id: faker.string.uuid(),
    name: template.name,
    title: template.title,
    description: template.description,
    icon: template.icon,
    points_required: template.points_required,
    condition_type: "points_threshold",
    condition_value: template.points_required,
    condition_meta: { threshold: template.points_required },
    is_active: true,
    rarity: template.rarity,
    created_at: faker.date.past({ years: 1 }).toISOString(),
  }));
}

export function generateAchievementInsertSQL(
  achievements: AchievementSeedData[]
): string {
  const values = achievements
    .map((achievement) => {
      return `(
      '${achievement.id}',
      '${achievement.name}',
      '${achievement.title.replace(/'/g, "''")}',
      '${achievement.description.replace(/'/g, "''")}',
      '${achievement.icon}',
      ${achievement.points_required},
      '${achievement.condition_type}',
      ${achievement.condition_value},
      '${JSON.stringify(achievement.condition_meta || {}).replace(/'/g, "''")}',
      ${achievement.is_active},
      '${achievement.rarity}',
      '${achievement.created_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample achievements (with conflict handling)
INSERT INTO public.achievements (
  id, name, title, description, icon, points_required, condition_type, 
  condition_value, condition_meta, is_active, rarity, created_at
) VALUES
    ${values}
ON CONFLICT (name) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  points_required = EXCLUDED.points_required,
  condition_type = EXCLUDED.condition_type,
  condition_value = EXCLUDED.condition_value,
  condition_meta = EXCLUDED.condition_meta,
  is_active = EXCLUDED.is_active,
  rarity = EXCLUDED.rarity;
`;
}
