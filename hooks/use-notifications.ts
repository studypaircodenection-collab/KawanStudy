"use client";

import { useState, useEffect, useCallback } from "react";
import { Notification, NotificationSettings } from "@/types/notification";

const STORAGE_KEYS = {
  NOTIFICATIONS: "kawanstudy_notifications",
  SETTINGS: "kawanstudy_notification_settings",
  LAST_READ: "kawanstudy_notifications_last_read",
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enablePushNotifications: true,
  enableEmailNotifications: true,
  enableStudyReminders: true,
  enableGroupInvites: true,
  enableExamReminders: true,
  enableAchievementNotifications: true,
  notificationSound: true,
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
  },
};

// Mock data generator for realistic notifications
const generateMockNotifications = (): Notification[] => {
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "message",
      title: "New Message",
      message: "Sarah sent you a message about tomorrow's study session",
      isRead: false,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      link: "/messages/sarah",
      priority: "medium",
      actionable: true,
      metadata: {
        senderId: "sarah123",
        senderName: "Sarah Johnson",
      },
    },
    {
      id: "2",
      type: "exam_reminder",
      title: "Exam Tomorrow",
      message: "Mathematics Final Exam is scheduled for tomorrow at 2:00 PM",
      isRead: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      link: "/schedule",
      priority: "high",
      actionable: true,
      metadata: {
        examDate: "2025-08-26T14:00:00Z",
      },
    },
    {
      id: "3",
      type: "group_invite",
      title: "Study Group Invitation",
      message:
        'You\'ve been invited to join "Physics Problem Solvers" study group',
      isRead: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      link: "/groups/physics-problem-solvers",
      priority: "medium",
      actionable: true,
      metadata: {
        groupId: "physics-group-1",
        groupName: "Physics Problem Solvers",
      },
    },
    {
      id: "4",
      type: "achievement",
      title: "Achievement Unlocked!",
      message:
        "You've completed 7 study sessions this week. Keep up the great work!",
      isRead: true,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      link: "/profile/achievements",
      priority: "low",
      actionable: false,
    },
    {
      id: "5",
      type: "study_session",
      title: "Study Session Starting Soon",
      message: "Your Chemistry study session starts in 15 minutes",
      isRead: false,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      link: "/schedule",
      priority: "high",
      actionable: true,
      metadata: {
        scheduleEntryId: "chem-session-1",
      },
    },
    {
      id: "6",
      type: "schedule_update",
      title: "Schedule Updated",
      message: "Your Monday morning lecture has been moved to Room 301",
      isRead: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      link: "/schedule",
      priority: "medium",
      actionable: false,
    },
    {
      id: "7",
      type: "message",
      title: "New Message",
      message: "Mike shared study notes for next week's assignment",
      isRead: true,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      link: "/messages/mike",
      priority: "low",
      actionable: false,
      metadata: {
        senderId: "mike456",
        senderName: "Mike Chen",
      },
    },
    {
      id: "8",
      type: "system",
      title: "System Maintenance",
      message: "Scheduled maintenance will occur tonight from 2 AM to 4 AM",
      isRead: true,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      link: "/system/status",
      priority: "low",
      actionable: false,
    },
  ];

  return mockNotifications;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(
        STORAGE_KEYS.NOTIFICATIONS
      );
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const savedLastRead = localStorage.getItem(STORAGE_KEYS.LAST_READ);

      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications).map(
          (n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          })
        );
        setNotifications(parsedNotifications);
      } else {
        // Initialize with mock data if no saved data exists
        const mockData = generateMockNotifications();
        setNotifications(mockData);
        localStorage.setItem(
          STORAGE_KEYS.NOTIFICATIONS,
          JSON.stringify(mockData)
        );
      }

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      if (savedLastRead) {
        setLastReadTimestamp(new Date(savedLastRead));
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      // Fallback to mock data
      setNotifications(generateMockNotifications());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(notifications)
      );
    }
  }, [notifications, isLoading]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
    const now = new Date();
    setLastReadTimestamp(now);
    localStorage.setItem(STORAGE_KEYS.LAST_READ, now.toISOString());
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
      return newNotification;
    },
    []
  );

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const getNotificationsByType = useCallback(
    (type: Notification["type"]) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications]
  );

  const getRecentNotifications = useCallback(
    (hours: number = 24) => {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      return notifications.filter((n) => n.timestamp > cutoff);
    },
    [notifications]
  );

  const updateSettings = useCallback(
    (newSettings: Partial<NotificationSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    []
  );

  // Simulate real-time notifications (in a real app, this would come from a WebSocket or polling)
  const simulateNewNotification = useCallback(() => {
    const types: Array<
      "message" | "study_session" | "exam_reminder" | "group_invite"
    > = ["message", "study_session", "exam_reminder", "group_invite"];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const messages: Record<typeof randomType, string> = {
      message: "You have a new message from a study partner",
      study_session: "Your study session is starting soon",
      exam_reminder: "Don't forget about your upcoming exam",
      group_invite: "You've been invited to join a new study group",
    };

    addNotification({
      type: randomType,
      title: "New Notification",
      message: messages[randomType],
      isRead: false,
      priority: "medium",
      actionable: true,
    });
  }, [addNotification]);

  return {
    notifications,
    settings,
    lastReadTimestamp,
    isLoading,
    unreadCount: getUnreadCount(),
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearAllNotifications,
    getNotificationsByType,
    getRecentNotifications,
    updateSettings,
    simulateNewNotification,
  };
}
