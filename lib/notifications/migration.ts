// Migration utility to transition from localStorage to database notifications
// Run this once after implementing the database-backed system

export async function migrateNotificationSystem() {
  console.log("Starting notification system migration...");

  try {
    // 1. Check if user is authenticated
    const response = await fetch("/api/user/profile");
    if (!response.ok) {
      throw new Error("User not authenticated");
    }

    // 2. Get existing localStorage notifications
    const existingNotifications = localStorage.getItem(
      "kawanstudy_notifications"
    );
    if (!existingNotifications) {
      console.log("No existing notifications to migrate");
      return;
    }

    const notifications = JSON.parse(existingNotifications);
    console.log(`Found ${notifications.length} notifications to migrate`);

    // 3. Migrate each notification to database
    for (const notification of notifications) {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority || "medium",
            actionable: notification.actionable || false,
            link: notification.link,
            avatar: notification.avatar,
            metadata: notification.metadata || {},
          }),
        });
      } catch (err) {
        console.error("Failed to migrate notification:", notification.id, err);
      }
    }

    // 4. Backup old data and clear localStorage
    localStorage.setItem(
      "kawanstudy_notifications_backup",
      existingNotifications
    );
    localStorage.removeItem("kawanstudy_notifications");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Initialize notification settings in database
export async function initializeNotificationSettings(settings = {}) {
  try {
    const response = await fetch("/api/notifications/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enablePushNotifications: true,
        enableEmailNotifications: true,
        enableStudyReminders: true,
        enableGroupInvites: true,
        enableExamReminders: true,
        enableAchievementNotifications: true,
        enableMessageNotifications: true,
        enableSystemNotifications: true,
        enableScheduleNotifications: true,
        notificationSound: true,
        quietHours: {
          enabled: false,
          startTime: "22:00",
          endTime: "08:00",
        },
        enableNotificationGrouping: true,
        maxNotificationsPerHour: 10,
        ...settings,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to initialize settings");
    }

    console.log("Notification settings initialized");
  } catch (error) {
    console.error("Failed to initialize notification settings:", error);
  }
}
