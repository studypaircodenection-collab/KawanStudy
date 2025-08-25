# KawanStudy Gamification System

## Overview

The KawanStudy gamification system is designed to increase user engagement through points, achievements, daily challenges, and leaderboards.

## Features

### 1. Points System

- **Total Points**: Accumulated points from all activities
- **Experience Points**: Used for level calculation
- **Point Sources**:
  - Tutor Session: 50 points
  - Class Join: 25 points
  - Quiz Completion: 15 points
  - Study Session: 10 points
  - Daily Login: 10 points

### 2. Level System

- **Formula**: `level = floor(sqrt(experience_points / 100)) + 1`
- **Examples**:
  - Level 1: 0-99 XP
  - Level 2: 100-399 XP
  - Level 3: 400-899 XP
  - Level 4: 900-1599 XP

### 3. Streak System

- **Current Streak**: Consecutive days of activity
- **Longest Streak**: Personal best streak record
- **Activity Tracking**: Updates when any point-earning activity occurs

### 4. Achievements & Badges

#### Points-based Achievements

- **Rookie** (🌟): 100 points
- **Rising Star** (⭐): 500 points
- **Scholar** (📚): 1,000 points
- **Expert** (🎓): 2,500 points
- **Master** (👑): 5,000 points
- **Legend** (🏆): 10,000 points
- **Tryhard** (💎): 25,000 points

#### Streak-based Achievements

- **Consistent** (🔥): 3-day streak
- **Dedicated** (💪): 7-day streak
- **Committed** (⚡): 14-day streak
- **Unstoppable** (🚀): 30-day streak

#### Activity-based Achievements

- **Tutor Helper** (👨‍🏫): 5 tutoring sessions
- **Class Joiner** (👥): 10 study classes
- **Quiz Master** (🧠): 20 quizzes
- **Study Addict** (📖): 50 study sessions

### 5. Daily Challenges

#### Easy Challenges (10-20 points)

- Daily login
- Complete 1 quiz
- Join a study class
- Update profile

#### Medium Challenges (25-40 points)

- Complete 30-minute study session
- Tutor another student
- Complete 3 quizzes in a row
- Join 2 different study classes

#### Hard Challenges (50-100 points)

- Complete 2 hours of study sessions
- Help 3 different students
- Complete 5 quizzes with high scores
- Join 5 different study groups

### 6. Leaderboard

- Ranked by total points
- Includes user stats: level, streaks, achievement count
- Public visibility for motivation

## Database Schema

### Core Tables

- `profiles` - Extended with gamification fields
- `point_transactions` - All point movements
- `achievements` - Achievement definitions
- `user_achievements` - User-earned achievements
- `daily_challenges` - Challenge definitions
- `user_daily_progress` - Daily challenge progress
- `activity_log` - User activity tracking

## API Endpoints

### GET /api/gamification

- `?action=stats&userId=<id>` - Get user stats
- `?action=leaderboard&limit=<n>` - Get leaderboard
- `?action=achievements&userId=<id>` - Get user achievements
- `?action=daily-challenges&userId=<id>` - Get daily challenges
- `?action=point-history&userId=<id>&limit=<n>` - Get point history

### POST /api/gamification

- `action: log-activity` - Log user activity
- `action: complete-challenge` - Complete daily challenge
- `action: add-points` - Add points to user

## Usage Examples

### Log Activity

```typescript
import { useGamification } from "@/hooks/use-gamification";

const { logActivity } = useGamification();

// Log tutor session
await logActivity("tutor_session", { sessionId: "123" }, 50);

// Log quiz completion
await logActivity("quiz", { quizId: "456", score: 85 }, 15);
```

### Complete Daily Challenge

```typescript
const { completeChallenge } = useGamification();

await completeChallenge(challengeId);
```

### Get User Stats

```typescript
const { userStats, statsLoading } = useGamification();

if (userStats) {
  console.log(`Level: ${userStats.profile.level}`);
  console.log(`Points: ${userStats.profile.total_points}`);
  console.log(`Rank: ${userStats.rank}`);
}
```

## Installation

### 1. Run Database Migrations

```sql
-- Option 1: Run individual files
\i supabase/migrations/001_profiles.sql
\i supabase/migrations/002_gamification.sql
\i supabase/migrations/003_gamification_data.sql
\i supabase/migrations/004_user_data.sql

-- Option 2: Run master schema
\i supabase/master_schema.sql
```

### 2. Set Up Row Level Security

All tables have RLS enabled with appropriate policies for user privacy and public leaderboard access.

### 3. Import Hooks and Types

```typescript
import { useGamification } from "@/hooks/use-gamification";
import { UserStats, LeaderboardEntry } from "@/lib/types";
```

## Best Practices

### Activity Logging

- Log activities immediately after completion
- Include relevant metadata in `activityData`
- Use consistent activity type names

### Performance

- Use the provided React hook for data management
- Cache results appropriately
- Batch related operations when possible

### User Experience

- Show progress indicators for challenges
- Celebrate achievements with notifications
- Display leaderboard updates regularly

## Testing

### Simulate Activities

```sql
-- Simulate user activities for testing
select public.simulate_user_activity(
  'user-id-here',
  'tutor_session',
  5  -- simulate 5 sessions
);
```

### Reset Daily Challenges

```sql
-- Reset daily challenges (normally done by cron job)
select public.reset_daily_challenges();
```

## Future Enhancements

- Weekly/Monthly challenges
- Team competitions
- Seasonal events
- Custom achievement creation
- Point redemption system
- Social features (following, sharing achievements)
