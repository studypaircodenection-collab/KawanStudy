import { faker } from "@faker-js/faker";

export interface UserAchievementSeedData {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export function generateUserAchievementSeedData(
  userIds: string[],
  achievementIds: string[],
  achievementData: Array<{ id: string; points_required: number }>
): UserAchievementSeedData[] {
  const userAchievements: UserAchievementSeedData[] = [];

  // For each user, determine which achievements they should have based on their points
  userIds.forEach((userId) => {
    // Get user's total points (we'll simulate this)
    const userPoints = faker.number.int({ min: 0, max: 15000 });

    // Sort achievements by points required
    const sortedAchievements = achievementData.sort(
      (a, b) => a.points_required - b.points_required
    );

    // Award achievements based on points threshold
    sortedAchievements.forEach((achievement) => {
      if (userPoints >= achievement.points_required) {
        // Higher chance for lower point achievements
        const probability =
          achievement.points_required <= 100
            ? 0.9
            : achievement.points_required <= 500
            ? 0.7
            : achievement.points_required <= 1000
            ? 0.5
            : achievement.points_required <= 5000
            ? 0.3
            : 0.1;

        if (faker.helpers.maybe(() => true, { probability })) {
          // Calculate earned date - should be after account creation but before now
          const baseDate = faker.date.past({ years: 1 });
          const earnedDate = new Date(
            baseDate.getTime() +
              faker.number.int({ min: 1, max: 365 }) * 24 * 60 * 60 * 1000
          );

          userAchievements.push({
            id: faker.string.uuid(),
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: earnedDate.toISOString(),
          });
        }
      }
    });
  });

  return userAchievements;
}

export function generateUserAchievementInsertSQL(
  userAchievements: UserAchievementSeedData[]
): string {
  if (userAchievements.length === 0) {
    return "-- No user achievements to insert\n";
  }

  const values = userAchievements
    .map((userAchievement) => {
      return `(
      '${userAchievement.id}',
      '${userAchievement.user_id}',
      '${userAchievement.achievement_id}',
      '${userAchievement.earned_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample user achievements
INSERT INTO public.user_achievements (
  id, user_id, achievement_id, earned_at
) VALUES
    ${values};
`;
}
