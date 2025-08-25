// This file contains all shared types used across the application

// User Profile Types
export interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  university: string | null;
  year_of_study: string | null;
  major: string | null;
  avatar_url: string | null;

  // Gamification fields
  total_points: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  experience_points: number;
  last_activity_date: string | null;

  created_at: string;
  updated_at: string | null;
}

// Gamification Types
export interface PointTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: "earned" | "spent" | "bonus" | "penalty";
  source: string;
  source_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string | null;
  points_required: number | null;
  condition_type:
    | "points_threshold"
    | "streak_length"
    | "activity_count"
    | "special";
  condition_value: number | null;
  condition_meta: Record<string, any> | null;
  is_active: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  created_at: string;
}

export interface UserAchievement {
  achievement_id: string;
  achievement_name: string;
  achievement_title: string;
  achievement_description: string;
  achievement_icon: string | null;
  rarity: string;
  earned_at: string;
}

export interface DailyChallenge {
  challenge_id: string;
  challenge_name: string;
  challenge_description: string;
  challenge_type:
    | "quiz"
    | "study_session"
    | "tutor_session"
    | "class_join"
    | "profile_update";
  target_value: number;
  points_reward: number;
  difficulty: "easy" | "medium" | "hard";
  current_progress: number;
  is_completed: boolean;
  progress_percentage: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  university: string | null;
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  achievement_count: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: Record<string, any> | null;
  points_earned: number;
  created_at: string;
}

export interface UserStats {
  profile: UserProfile;
  rank: number | null;
  achievements_count: number;
  recent_transactions: PointTransaction[];
  daily_challenges_completed_today: number;
}

// Form Types
export interface ProfileFormData {
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  university?: string;
  year_of_study?: string;
  major?: string;
  avatar_url?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Authentication Types
export interface Claims {
  sub: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}
