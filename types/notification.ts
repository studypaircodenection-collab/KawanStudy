export interface Notification {
  id: string;
  type:
    | "message"
    | "study_session"
    | "exam_reminder"
    | "group_invite"
    | "achievement"
    | "system"
    | "schedule_update";
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  link?: string;
  avatar?: string;
  priority: "low" | "medium" | "high";
  actionable?: boolean;
  metadata?: {
    senderId?: string;
    senderName?: string;
    groupId?: string;
    groupName?: string;
    examDate?: string;
    scheduleEntryId?: string;
    category?: string;
    course?: string;
  };
}

export interface NotificationSettings {
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableStudyReminders: boolean;
  enableGroupInvites: boolean;
  enableExamReminders: boolean;
  enableAchievementNotifications: boolean;
  notificationSound: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export const NOTIFICATION_TYPES = {
  message: {
    icon: "💬",
    color: "#3B82F6",
    label: "Message",
  },
  study_session: {
    icon: "📚",
    color: "#10B981",
    label: "Study Session",
  },
  exam_reminder: {
    icon: "📝",
    color: "#EF4444",
    label: "Exam Reminder",
  },
  group_invite: {
    icon: "👥",
    color: "#8B5CF6",
    label: "Group Invite",
  },
  achievement: {
    icon: "🏆",
    color: "#F59E0B",
    label: "Achievement",
  },
  system: {
    icon: "⚙️",
    color: "#6B7280",
    label: "System",
  },
  schedule_update: {
    icon: "📅",
    color: "#06B6D4",
    label: "Schedule Update",
  },
} as const;
