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
  level: number;
  experience_points: number;

  created_at: string;
  updated_at: string | null;
}

// Gamification Types
export interface PointTransaction {
  transaction_id: string;
  points: number;
  transaction_type: "earned" | "spent" | "bonus" | "penalty";
  source: string;
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
  condition_type: "points_threshold";
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

// Messaging Types
export interface Conversation {
  id: string;
  participant_1: UserProfile;
  participant_2: UserProfile;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  content: string;
  message_type: "text" | "image" | "file";
  metadata?: Record<string, any>;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  other_user: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  updated_at: string;
  unread_count: number;
}

export interface MessageReadStatus {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

// Peer Connection Types
export interface PeerConnection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "declined" | "blocked";
  created_at: string;
  updated_at: string;
  requester: UserProfile;
  addressee: UserProfile;
}

export interface PeerUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  university: string | null;
  major: string | null;
  year_of_study: string | null;
  bio: string | null;
  connection_status:
    | "connected"
    | "pending_sent"
    | "pending_received"
    | "not_connected"
    | "blocked";
  mutual_connections: number;
  is_online: boolean;
  last_seen: string | null;
  location: string | null;
}

export interface ConnectionRequest {
  id: string;
  requester: UserProfile;
  addressee: UserProfile;
  message?: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
}
