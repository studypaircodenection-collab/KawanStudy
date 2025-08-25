import { z } from "zod";

// Activity logging schema
export const activityLogSchema = z.object({
  activityType: z.enum([
    "tutor_session",
    "class_join",
    "quiz",
    "study_session",
    "profile_update",
    "login",
    "achievement_earned",
  ]),
  activityData: z.record(z.string(), z.any()).optional(),
  pointsEarned: z.number().min(0).optional(),
});

export type ActivityLogData = z.infer<typeof activityLogSchema>;

// Daily challenge completion schema
export const challengeCompletionSchema = z.object({
  challengeId: z.string().uuid(),
});

export type ChallengeCompletionData = z.infer<typeof challengeCompletionSchema>;

// Add points schema
export const addPointsSchema = z.object({
  points: z.number(),
  source: z.string(),
  sourceId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export type AddPointsData = z.infer<typeof addPointsSchema>;

// Leaderboard query schema
export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type LeaderboardQueryData = z.infer<typeof leaderboardQuerySchema>;

// Point history query schema
export const pointHistoryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type PointHistoryQueryData = z.infer<typeof pointHistoryQuerySchema>;

// Activity simulation schema (for testing)
export const simulateActivitySchema = z.object({
  activityType: z.enum([
    "tutor_session",
    "class_join",
    "quiz",
    "study_session",
  ]),
  count: z.number().min(1).max(10).default(1),
});

export type SimulateActivityData = z.infer<typeof simulateActivitySchema>;
