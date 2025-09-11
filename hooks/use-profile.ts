"use client";

import { useState, useEffect } from "react";

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  header_image_url?: string;
  location?: string;
  university?: string;
  year_of_study?: string;
  major?: string;
  linkedin_url?: string;
  github_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  website_url?: string;
  level: number;
  total_points: number;
  created_at: string;
}

interface UserAchievement {
  achievement_id: string;
  title: string;
  description: string;
  icon: string;
  badge_color: string;
  earned_at: string;
}

interface PointTransaction {
  transaction_id: string;
  transaction_type: string;
  points: number;
  source: string;
  description?: string;
  created_at: string;
}

interface NoteData {
  id: string;
  title: string;
  description: string;
  subject: string;
  noteType: string;
  tags: string[];
  createdAt: string;
  estimatedReadTime: number;
  viewCount?: number;
  downloadCount?: number;
  likeCount?: number;
  thumbnailUrl?: string;
  academicLevel?: string;
  language?: string;
  difficultyLevel?: string;
  institution?: string;
  userProfile?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

interface ProfileApiResponse {
  profile: UserProfile;
  currentUser: {
    username: string | null;
    userId: string | null;
  };
  achievements: UserAchievement[];
  connectionsCount: number;
  pointHistory: PointTransaction[];
  notes: {
    notes: NoteData[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export function useProfile(username: string) {
  const [data, setData] = useState<ProfileApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/profile/${username}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Profile not found");
        }
        throw new Error("Failed to fetch profile");
      }

      const profileData = await response.json();
      setData(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  return { data, loading, error, refetch: fetchProfile };
}
