import { faker } from "@faker-js/faker";

export interface NotificationSeedData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  link?: string;
  metadata: object;
  expires_at?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationSettingsSeedData {
  user_id: string;
  enable_push_notifications: boolean;
  enable_email_notifications: boolean;
  notification_sound: boolean;
  enable_study_reminders: boolean;
  enable_group_invites: boolean;
  enable_exam_reminders: boolean;
  enable_achievement_notifications: boolean;
  enable_message_notifications: boolean;
  enable_system_notifications: boolean;
  enable_schedule_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  enable_notification_grouping: boolean;
  max_notifications_per_hour: number;
  created_at: string;
  updated_at: string;
}

const notificationTypes = [
  "message",
  "study_session",
  "exam_reminder",
  "group_invite",
  "achievement",
  "system",
  "schedule_update",
];

const notificationPriorities = ["low", "medium", "high"];

const notificationTemplates = {
  message: [
    "You have a new message from a study partner",
    "New message received in your conversation",
    "Someone wants to chat about studies",
  ],
  study_session: [
    "Time for your study session",
    "Don't forget your scheduled study time",
    "Study reminder: Review your notes",
  ],
  exam_reminder: [
    "Quiz completed! Check your results",
    "Great job on completing the quiz",
    "Your quiz score is ready to view",
  ],
  group_invite: [
    "New study partner wants to connect",
    "Someone accepted your connection request",
    "You have a new study buddy",
  ],
  achievement: [
    "Congratulations! You unlocked a new achievement",
    "New badge earned! Check out your achievement",
    "Achievement unlocked! You're making great progress",
  ],
  system: [
    "New daily challenge available",
    "Complete today's challenge for bonus points",
    "Don't miss today's study challenge",
  ],
  schedule_update: [
    "Someone commented on your note",
    "Your study note received a new comment",
    "A peer left feedback on your shared note",
  ],
};

export function generateNotificationSeedData(
  userIds: string[],
  count: number = 200
): NotificationSeedData[] {
  const notifications: NotificationSeedData[] = [];

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(notificationTypes);
    const templates =
      notificationTemplates[type as keyof typeof notificationTemplates];
    const message = templates
      ? faker.helpers.arrayElement(templates)
      : faker.lorem.sentence();

    const isRead =
      faker.helpers.maybe(() => true, { probability: 0.6 }) ?? false;
    const createdAt = faker.date.past({ years: 1 });
    const readAt = isRead
      ? faker.date.between({ from: createdAt, to: new Date() })
      : undefined;

    const notification: NotificationSeedData = {
      id: faker.string.uuid(),
      user_id: faker.helpers.arrayElement(userIds),
      title: generateNotificationTitle(type),
      message,
      type,
      priority: faker.helpers.weightedArrayElement([
        { weight: 0.5, value: "low" },
        { weight: 0.3, value: "medium" },
        { weight: 0.2, value: "high" },
      ]),
      is_read: isRead,
      link: faker.helpers.maybe(
        () =>
          `/dashboard/${faker.helpers.arrayElement([
            "achievements",
            "messages",
            "notes",
            "quizzes",
          ])}`,
        { probability: 0.4 }
      ),
      metadata: generateNotificationMetadata(type),
      expires_at: faker.helpers.maybe(
        () => faker.date.future({ years: 1 }).toISOString(),
        { probability: 0.2 }
      ),
      created_at: createdAt.toISOString(),
      read_at: readAt?.toISOString(),
    };

    notifications.push(notification);
  }

  return notifications.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function generateNotificationTitle(type: string): string {
  const titleMap: Record<string, string[]> = {
    achievement_unlocked: [
      "🏆 Achievement Unlocked!",
      "🌟 New Badge Earned!",
      "🎉 Congratulations!",
    ],
    new_message: ["💬 New Message", "📧 Message Received", "💭 Chat Update"],
    note_commented: ["💬 New Comment", "📝 Note Feedback", "🗨️ Comment Added"],
    note_liked: [
      "❤️ Note Liked",
      "👍 Content Appreciated",
      "⭐ Positive Feedback",
    ],
    quiz_completed: [
      "✅ Quiz Complete",
      "📊 Results Ready",
      "🎯 Quiz Finished",
    ],
    daily_challenge: [
      "⚡ Daily Challenge",
      "🎯 New Challenge",
      "💪 Challenge Alert",
    ],
    peer_connection: [
      "🤝 New Connection",
      "👥 Study Buddy",
      "🔗 Connection Request",
    ],
    study_reminder: ["📚 Study Time", "⏰ Study Reminder", "📖 Time to Study"],
    system_announcement: [
      "📢 Announcement",
      "🔔 System Update",
      "ℹ️ Important Notice",
    ],
    content_approved: [
      "✅ Content Approved",
      "🎉 Published Successfully",
      "👍 Review Complete",
    ],
  };

  const titles = titleMap[type] || ["🔔 Notification"];
  return faker.helpers.arrayElement(titles);
}

function generateNotificationMetadata(type: string): object {
  const metadataMap: Record<string, () => object> = {
    achievement_unlocked: () => ({
      achievement_id: faker.string.uuid(),
      achievement_name: faker.helpers.arrayElement([
        "first_login",
        "note_master",
        "quiz_champion",
      ]),
      points_earned: faker.number.int({ min: 10, max: 500 }),
    }),
    new_message: () => ({
      conversation_id: faker.string.uuid(),
      sender_name: faker.person.firstName(),
      message_preview: faker.lorem.sentence(),
    }),
    note_commented: () => ({
      note_id: faker.string.uuid(),
      note_title: faker.lorem.words(4),
      commenter_name: faker.person.firstName(),
    }),
    quiz_completed: () => ({
      quiz_id: faker.string.uuid(),
      quiz_title: faker.lorem.words(3),
      score: faker.number.int({ min: 0, max: 100 }),
      percentage: faker.number.int({ min: 0, max: 100 }),
    }),
  };

  const generator = metadataMap[type];
  return generator ? generator() : {};
}

export function generateNotificationSettingsSeedData(
  userIds: string[]
): NotificationSettingsSeedData[] {
  return userIds.map((userId) => {
    const quietHoursEnabled =
      faker.helpers.maybe(() => true, { probability: 0.6 }) ?? false;
    const settings: NotificationSettingsSeedData = {
      user_id: userId,
      enable_push_notifications:
        faker.helpers.maybe(() => true, { probability: 0.9 }) ?? true,
      enable_email_notifications:
        faker.helpers.maybe(() => true, { probability: 0.8 }) ?? true,
      notification_sound:
        faker.helpers.maybe(() => true, { probability: 0.7 }) ?? true,
      enable_study_reminders:
        faker.helpers.maybe(() => true, { probability: 0.85 }) ?? true,
      enable_group_invites:
        faker.helpers.maybe(() => true, { probability: 0.9 }) ?? true,
      enable_exam_reminders:
        faker.helpers.maybe(() => true, { probability: 0.95 }) ?? true,
      enable_achievement_notifications:
        faker.helpers.maybe(() => true, { probability: 0.9 }) ?? true,
      enable_message_notifications:
        faker.helpers.maybe(() => true, { probability: 0.95 }) ?? true,
      enable_system_notifications:
        faker.helpers.maybe(() => true, { probability: 0.8 }) ?? true,
      enable_schedule_notifications:
        faker.helpers.maybe(() => true, { probability: 0.85 }) ?? true,
      quiet_hours_enabled: quietHoursEnabled,
      quiet_hours_start: quietHoursEnabled ? "22:00:00" : undefined,
      quiet_hours_end: quietHoursEnabled ? "08:00:00" : undefined,
      enable_notification_grouping:
        faker.helpers.maybe(() => true, { probability: 0.8 }) ?? true,
      max_notifications_per_hour: faker.helpers.arrayElement([5, 10, 15, 20]),
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    };

    return settings;
  });
}

export function generateNotificationInsertSQL(
  notifications: NotificationSeedData[]
): string {
  if (notifications.length === 0) {
    return "-- No notifications to insert\n";
  }

  const values = notifications
    .map((notification) => {
      return `(
      '${notification.id}',
      '${notification.user_id}',
      '${notification.title.replace(/'/g, "''")}',
      '${notification.message.replace(/'/g, "''")}',
      '${notification.type}',
      '${notification.priority}',
      ${notification.is_read},
      ${notification.link ? `'${notification.link}'` : "NULL"},
      '${JSON.stringify(notification.metadata).replace(/'/g, "''")}',
      ${notification.expires_at ? `'${notification.expires_at}'` : "NULL"},
      '${notification.created_at}',
      ${notification.read_at ? `'${notification.read_at}'` : "NULL"}
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample notifications
INSERT INTO public.notifications (
  id, user_id, title, message, type, priority, is_read, link, 
  metadata, expires_at, created_at, read_at
) VALUES
    ${values};
`;
}

export function generateNotificationSettingsInsertSQL(
  settings: NotificationSettingsSeedData[]
): string {
  if (settings.length === 0) {
    return "-- No notification settings to insert\n";
  }

  const values = settings
    .map((setting) => {
      return `(
      '${setting.user_id}',
      ${setting.enable_push_notifications},
      ${setting.enable_email_notifications},
      ${setting.notification_sound},
      ${setting.enable_study_reminders},
      ${setting.enable_group_invites},
      ${setting.enable_exam_reminders},
      ${setting.enable_achievement_notifications},
      ${setting.enable_message_notifications},
      ${setting.enable_system_notifications},
      ${setting.enable_schedule_notifications},
      ${setting.quiet_hours_enabled},
      ${setting.quiet_hours_start ? `'${setting.quiet_hours_start}'` : "NULL"},
      ${setting.quiet_hours_end ? `'${setting.quiet_hours_end}'` : "NULL"},
      ${setting.enable_notification_grouping},
      ${setting.max_notifications_per_hour},
      '${setting.created_at}',
      '${setting.updated_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample notification settings
INSERT INTO public.notification_settings (
  user_id, enable_push_notifications, enable_email_notifications, notification_sound,
  enable_study_reminders, enable_group_invites, enable_exam_reminders, 
  enable_achievement_notifications, enable_message_notifications, enable_system_notifications,
  enable_schedule_notifications, quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
  enable_notification_grouping, max_notifications_per_hour, created_at, updated_at
) VALUES
    ${values};
`;
}
