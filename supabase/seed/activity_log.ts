import { faker } from "@faker-js/faker";

export interface UserDailyProgressSeedData {
  id: string;
  user_id: string;
  challenge_id: string;
  date: string;
  completed: boolean;
  progress_value: number;
  target_value: number;
  points_earned: number;
  completed_at?: string;
  created_at: string;
}

export interface ActivityLogSeedData {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  metadata: object;
  created_at: string;
}

const activityActions = [
  "login",
  "logout",
  "profile_update",
  "note_upload",
  "note_view",
  "note_like",
  "note_comment",
  "note_download",
  "quiz_create",
  "quiz_attempt",
  "quiz_complete",
  "message_send",
  "achievement_unlock",
  "daily_challenge_complete",
  "peer_connect",
  "search_perform",
];

const targetTypes = [
  "user",
  "note",
  "quiz",
  "message",
  "achievement",
  "daily_challenge",
  "conversation",
];

export function generateUserDailyProgressSeedData(
  userIds: string[],
  challengeIds: string[],
  daysBack: number = 30
): UserDailyProgressSeedData[] {
  const progressData: UserDailyProgressSeedData[] = [];

  userIds.forEach((userId) => {
    // Generate progress for the last 30 days
    for (let i = 0; i < daysBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      // Each user might complete 0-3 challenges per day
      const challengesToday = faker.number.int({ min: 0, max: 3 });
      const selectedChallenges = faker.helpers.arrayElements(
        challengeIds,
        challengesToday
      );

      selectedChallenges.forEach((challengeId) => {
        const targetValue = faker.number.int({ min: 1, max: 5 });
        const completed =
          faker.helpers.maybe(() => true, { probability: 0.7 }) ?? false;
        const progressValue = completed
          ? targetValue
          : faker.number.int({ min: 0, max: targetValue - 1 });
        const pointsEarned = completed
          ? faker.number.int({ min: 10, max: 100 })
          : 0;

        const baseDate = new Date(date);
        const completedAt = completed
          ? new Date(
              baseDate.getTime() +
                faker.number.int({ min: 0, max: 23 * 60 * 60 * 1000 })
            )
          : undefined;

        progressData.push({
          id: faker.string.uuid(),
          user_id: userId,
          challenge_id: challengeId,
          date: dateString,
          completed,
          progress_value: progressValue,
          target_value: targetValue,
          points_earned: pointsEarned,
          completed_at: completedAt?.toISOString(),
          created_at: baseDate.toISOString(),
        });
      });
    }
  });

  return progressData.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function generateActivityLogSeedData(
  userIds: string[],
  count: number = 1000
): ActivityLogSeedData[] {
  const activities: ActivityLogSeedData[] = [];

  for (let i = 0; i < count; i++) {
    const action = faker.helpers.arrayElement(activityActions);
    const targetType = getTargetTypeForAction(action);
    const targetId = faker.helpers.maybe(() => faker.string.uuid(), {
      probability: 0.8,
    });

    const activity: ActivityLogSeedData = {
      id: faker.string.uuid(),
      user_id: faker.helpers.arrayElement(userIds),
      action,
      target_type: targetType,
      target_id: targetId,
      metadata: generateActivityMetadata(action, targetType),
      created_at: faker.date.past({ years: 1 }).toISOString(),
    };

    activities.push(activity);
  }

  return activities.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function getTargetTypeForAction(action: string): string {
  const actionTargetMap: Record<string, string> = {
    login: "user",
    logout: "user",
    profile_update: "user",
    note_upload: "note",
    note_view: "note",
    note_like: "note",
    note_comment: "note",
    note_download: "note",
    quiz_create: "quiz",
    quiz_attempt: "quiz",
    quiz_complete: "quiz",
    message_send: "message",
    achievement_unlock: "achievement",
    daily_challenge_complete: "daily_challenge",
    peer_connect: "user",
    search_perform: "user",
  };

  return actionTargetMap[action] || "user";
}

function generateActivityMetadata(action: string, targetType: string): object {
  const metadataMap: Record<string, () => object> = {
    login: () => ({
      ip_address: faker.internet.ip(),
      user_agent: faker.internet.userAgent(),
      location: faker.location.city(),
    }),
    note_upload: () => ({
      note_title: faker.lorem.words(4),
      subject: faker.helpers.arrayElement([
        "Mathematics",
        "Computer Science",
        "Physics",
      ]),
      file_size: faker.number.int({ min: 100000, max: 5000000 }),
    }),
    quiz_complete: () => ({
      score: faker.number.int({ min: 0, max: 100 }),
      time_taken: faker.number.int({ min: 60, max: 1800 }),
      questions_total: faker.number.int({ min: 5, max: 20 }),
    }),
    search_perform: () => ({
      query: faker.lorem.words(faker.number.int({ min: 1, max: 4 })),
      results_count: faker.number.int({ min: 0, max: 50 }),
      filter_applied: faker.datatype.boolean(),
    }),
  };

  const generator = metadataMap[action];
  return generator ? generator() : {};
}

export function generateUserDailyProgressInsertSQL(
  progressData: UserDailyProgressSeedData[]
): string {
  if (progressData.length === 0) {
    return "-- No user daily progress to insert\n";
  }

  const values = progressData
    .map((progress) => {
      return `(
      '${progress.id}',
      '${progress.user_id}',
      '${progress.challenge_id}',
      '${progress.date}',
      ${progress.completed},
      ${progress.progress_value},
      ${progress.target_value},
      ${progress.points_earned},
      ${progress.completed_at ? `'${progress.completed_at}'` : "NULL"},
      '${progress.created_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample user daily progress
INSERT INTO public.user_daily_progress (
  id, user_id, challenge_id, date, completed, progress_value, 
  target_value, points_earned, completed_at, created_at
) VALUES
    ${values};
`;
}

export function generateActivityLogInsertSQL(
  activities: ActivityLogSeedData[]
): string {
  if (activities.length === 0) {
    return "-- No activity log entries to insert\n";
  }

  const values = activities
    .map((activity) => {
      return `(
      '${activity.id}',
      '${activity.user_id}',
      '${activity.action}',
      '${activity.target_type}',
      ${activity.target_id ? `'${activity.target_id}'` : "NULL"},
      '${JSON.stringify(activity.metadata).replace(/'/g, "''")}',
      '${activity.created_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample activity log
INSERT INTO public.activity_log (
  id, user_id, action, target_type, target_id, metadata, created_at
) VALUES
    ${values};
`;
}
