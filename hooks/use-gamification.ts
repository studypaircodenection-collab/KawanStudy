import { useState, useEffect, useCallback } from "react";
import {
  UserStats,
  LeaderboardEntry,
  UserAchievement,
  DailyChallenge,
  PointTransaction,
} from "@/lib/types";

interface UseGamificationReturn {
  // Data
  userStats: UserStats | null;
  leaderboard: LeaderboardEntry[];
  achievements: UserAchievement[];
  dailyChallenges: DailyChallenge[];
  pointHistory: PointTransaction[];

  // Loading states
  statsLoading: boolean;
  leaderboardLoading: boolean;
  achievementsLoading: boolean;
  challengesLoading: boolean;
  pointHistoryLoading: boolean;

  // Actions
  logActivity: (
    activityType: string,
    activityData?: any,
    pointsEarned?: number
  ) => Promise<boolean>;
  completeChallenge: (challengeId: string) => Promise<boolean>;
  addPoints: (
    points: number,
    source: string,
    sourceId?: string,
    description?: string
  ) => Promise<boolean>;
  refreshStats: () => Promise<void>;
  refreshLeaderboard: (limit?: number) => Promise<void>;
  refreshAchievements: () => Promise<void>;
  refreshChallenges: () => Promise<void>;
  refreshPointHistory: (limit?: number) => Promise<void>;
}

export function useGamification(userId?: string): UseGamificationReturn {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);

  const [statsLoading, setStatsLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [pointHistoryLoading, setPointHistoryLoading] = useState(false);

  // Fetch user stats
  const refreshStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams({
        action: "stats",
        ...(userId && { userId }),
      });

      const response = await fetch(`/api/gamification?${params}`);
      if (response.ok) {
        const result = await response.json();
        setUserStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [userId]);

  // Fetch leaderboard
  const refreshLeaderboard = useCallback(async (limit = 10) => {
    setLeaderboardLoading(true);
    try {
      const params = new URLSearchParams({
        action: "leaderboard",
        limit: limit.toString(),
      });

      const response = await fetch(`/api/gamification?${params}`);
      if (response.ok) {
        const result = await response.json();
        setLeaderboard(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  // Fetch achievements
  const refreshAchievements = useCallback(async () => {
    setAchievementsLoading(true);
    try {
      const params = new URLSearchParams({
        action: "achievements",
        ...(userId && { userId }),
      });

      const response = await fetch(`/api/gamification?${params}`);
      if (response.ok) {
        const result = await response.json();
        setAchievements(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setAchievementsLoading(false);
    }
  }, [userId]);

  // Fetch daily challenges
  const refreshChallenges = useCallback(async () => {
    setChallengesLoading(true);
    try {
      const params = new URLSearchParams({
        action: "daily-challenges",
        ...(userId && { userId }),
      });

      const response = await fetch(`/api/gamification?${params}`);
      if (response.ok) {
        const result = await response.json();
        setDailyChallenges(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching daily challenges:", error);
    } finally {
      setChallengesLoading(false);
    }
  }, [userId]);

  // Fetch point history
  const refreshPointHistory = useCallback(
    async (limit = 20) => {
      setPointHistoryLoading(true);
      try {
        const params = new URLSearchParams({
          action: "point-history",
          limit: limit.toString(),
          ...(userId && { userId }),
        });

        const response = await fetch(`/api/gamification?${params}`);
        if (response.ok) {
          const result = await response.json();
          setPointHistory(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching point history:", error);
      } finally {
        setPointHistoryLoading(false);
      }
    },
    [userId]
  );

  // Log activity
  const logActivity = useCallback(
    async (
      activityType: string,
      activityData: any = {},
      pointsEarned = 0
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/gamification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "log-activity",
            activityType,
            activityData,
            pointsEarned,
          }),
        });

        if (response.ok) {
          // Refresh relevant data
          await Promise.all([refreshStats(), refreshChallenges()]);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error logging activity:", error);
        return false;
      }
    },
    [refreshStats, refreshChallenges]
  );

  // Complete challenge
  const completeChallenge = useCallback(
    async (challengeId: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/gamification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "complete-challenge",
            challengeId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Refresh relevant data
          await Promise.all([
            refreshStats(),
            refreshChallenges(),
            refreshPointHistory(),
          ]);
          return result.completed;
        }
        return false;
      } catch (error) {
        console.error("Error completing challenge:", error);
        return false;
      }
    },
    [refreshStats, refreshChallenges, refreshPointHistory]
  );

  // Add points
  const addPoints = useCallback(
    async (
      points: number,
      source: string,
      sourceId?: string,
      description?: string
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/gamification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add-points",
            points,
            source,
            sourceId,
            description,
          }),
        });

        if (response.ok) {
          // Refresh relevant data
          await Promise.all([refreshStats(), refreshPointHistory()]);
          
          // Dispatch custom event for real-time UI updates
          window.dispatchEvent(
            new CustomEvent("points-updated", {
              detail: { points, source, sourceId, description },
            })
          );
          
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error adding points:", error);
        return false;
      }
    },
    [refreshStats, refreshPointHistory]
  );

  // Initial data fetch
  useEffect(() => {
    refreshStats();
    refreshLeaderboard();
    refreshAchievements();
    refreshChallenges();
    refreshPointHistory();
  }, [
    refreshStats,
    refreshLeaderboard,
    refreshAchievements,
    refreshChallenges,
    refreshPointHistory,
  ]);

  return {
    // Data
    userStats,
    leaderboard,
    achievements,
    dailyChallenges,
    pointHistory,

    // Loading states
    statsLoading,
    leaderboardLoading,
    achievementsLoading,
    challengesLoading,
    pointHistoryLoading,

    // Actions
    logActivity,
    completeChallenge,
    addPoints,
    refreshStats,
    refreshLeaderboard,
    refreshAchievements,
    refreshChallenges,
    refreshPointHistory,
  };
}
