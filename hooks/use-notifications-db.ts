"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Notification, NotificationSettings } from "@/types/notification";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

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

// Transform database notification to client notification
const transformNotification = (dbNotification: any): Notification => ({
  id: dbNotification.id,
  type: dbNotification.type,
  title: dbNotification.title,
  message: dbNotification.message,
  isRead: dbNotification.is_read,
  timestamp: new Date(dbNotification.created_at),
  priority: dbNotification.priority,
  actionable: dbNotification.actionable,
  link: dbNotification.link,
  avatar: dbNotification.avatar,
  metadata: dbNotification.metadata,
});

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  const supabase = createClient();
  const realtimeChannel = useRef<RealtimeChannel | null>(null);

  // Load initial data
  useEffect(() => {
    loadNotifications();
    loadSettings();
    setupRealtimeSubscription();

    return () => {
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc("get_user_notifications", {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;

      const transformedNotifications = data?.map(transformNotification) || [];
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("Failed to load notifications");
      // Fallback to localStorage if database fails
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data, error } = await supabase.rpc(
        "get_user_notification_settings",
        {
          p_user_id: user.data.user.id,
        }
      );

      if (error) throw error;

      if (data && data.length > 0) {
        const dbSettings = data[0];
        setSettings({
          enablePushNotifications: dbSettings.enable_push_notifications,
          enableEmailNotifications: dbSettings.enable_email_notifications,
          enableStudyReminders: dbSettings.enable_study_reminders,
          enableGroupInvites: dbSettings.enable_group_invites,
          enableExamReminders: dbSettings.enable_exam_reminders,
          enableAchievementNotifications:
            dbSettings.enable_achievement_notifications,
          notificationSound: dbSettings.notification_sound,
          quietHours: {
            enabled: dbSettings.quiet_hours_enabled,
            startTime: dbSettings.quiet_hours_start,
            endTime: dbSettings.quiet_hours_end,
          },
        });
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      // Keep default settings on error
    }
  };

  const setupRealtimeSubscription = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    console.log("🔗 Setting up realtime subscription for user:", user.data.user.id);

    realtimeChannel.current = supabase
      .channel(`notifications:${user.data.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.data.user.id}`,
        },
        (payload) => {
          console.log("➕ New notification received:", payload.new);
          const newNotification = transformNotification(payload.new);
          setNotifications((prev) => [newNotification, ...prev]);

          // Play notification sound if enabled
          if (settings.notificationSound) {
            playNotificationSound();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.data.user.id}`,
        },
        (payload) => {
          console.log("📝 Notification updated:", payload.new);
          const updatedNotification = transformNotification(payload.new);
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.data.user.id}`,
        },
        (payload) => {
          console.log("🗑️ Notification deleted via realtime:", payload.old);
          const deletedId = payload.old.id;
          setNotifications((prev) => prev.filter((n) => n.id !== deletedId));
        }
      )
      .subscribe((status) => {
        console.log("🔄 Realtime subscription status:", status);
      });
  };

  const playNotificationSound = () => {
    // Simple notification sound - in production, use a proper audio file
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.1;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Fallback to localStorage for offline support
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem("kawanstudy_notifications");
      if (saved) {
        const parsed = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(parsed);
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
    }
  };

  const saveToLocalStorage = (notifications: Notification[]) => {
    try {
      localStorage.setItem(
        "kawanstudy_notifications",
        JSON.stringify(notifications)
      );
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  };

  // Save to localStorage as backup
  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage(notifications);
    }
  }, [notifications, isLoading]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Set loading state for this specific action
      setActionLoading((prev) =>
        new Set(prev).add(`mark-read-${notificationId}`)
      );

      // Optimistic update - update UI immediately
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Then sync with backend
      try {
        const { error } = await supabase.rpc("mark_notifications_read", {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_notification_ids: [notificationId],
        });

        if (error) throw error;
      } catch (err) {
        console.error("Error syncing mark as read to backend:", err);
        // Revert optimistic update on failure
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: false }
              : notification
          )
        );
        // Show error toast or notification
        throw err;
      } finally {
        setActionLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(`mark-read-${notificationId}`);
          return newSet;
        });
      }
    },
    [supabase]
  );

  const markAllAsRead = useCallback(async () => {
    // Set loading state for mark all action
    setActionLoading((prev) => new Set(prev).add("mark-all"));

    // Optimistic update - update UI immediately
    const originalNotifications = notifications;
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );

    // Then sync with backend
    try {
      const { error } = await supabase.rpc("mark_notifications_read", {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_notification_ids: null, // null means mark all as read
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error syncing mark all as read to backend:", err);
      // Revert optimistic update on failure
      setNotifications(originalNotifications);
      throw err;
    } finally {
      setActionLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete("mark-all");
        return newSet;
      });
    }
  }, [supabase, notifications]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      console.log("🗑️ Attempting to delete notification:", notificationId);
      
      // Set loading state for this specific action
      setActionLoading((prev) => new Set(prev).add(`delete-${notificationId}`));

      // Store original notification for potential rollback
      const originalNotification = notifications.find(
        (n) => n.id === notificationId
      );
      
      if (!originalNotification) {
        console.warn("⚠️ Notification not found in local state:", notificationId);
        setActionLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(`delete-${notificationId}`);
          return newSet;
        });
        return;
      }

      // Optimistic update - remove from UI immediately
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("User not authenticated");
        }

        console.log("🔄 Calling delete RPC function...");
        
        // Use the RPC function that should exist after database reset
        const { data, error } = await supabase.rpc("delete_user_notification", {
          p_notification_id: notificationId,
        });

        console.log("📊 Delete RPC response:", { data, error });

        if (error) {
          console.error("❌ RPC delete error:", error);
          throw error;
        }

        // Check if the deletion was successful
        if (data === false || data === 0) {
          throw new Error("Notification not found or access denied");
        }

        console.log("✅ Notification deleted successfully");
        
        // Clear any error state
        setError(null);
        
      } catch (err) {
        console.error("💥 Error deleting notification:", err);
        
        // Revert optimistic update on failure
        setNotifications((prev) =>
          [...prev, originalNotification].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() -
              new Date(a.timestamp).getTime()
          )
        );
        
        // Set error state for user feedback
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to delete notification: ${errorMessage}`);
        
        // Re-throw for component-level error handling
        throw err;
      } finally {
        setActionLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(`delete-${notificationId}`);
          return newSet;
        });
      }
    },
    [supabase, notifications]
  );

  const clearAllNotifications = useCallback(async () => {
    console.log("🧹 Attempting to clear all notifications");
    
    // Set loading state for clear all action
    setActionLoading((prev) => new Set(prev).add("clear-all"));

    // Store original notifications for potential rollback
    const originalNotifications = [...notifications];
    const notificationCount = notifications.length;

    // Optimistic update - clear UI immediately
    setNotifications([]);

    try {
      console.log("🔄 Calling clear all RPC function...");

      // Use the new RPC function for reliable deletion
      const { data, error } = await supabase.rpc("clear_all_user_notifications");

      console.log("📊 Clear all RPC response:", { data, error, deletedCount: data });

      if (error) {
        console.error("❌ RPC clear all error:", error);
        throw error;
      }

      console.log(`✅ Successfully cleared ${data || 0} notifications`);
      
      // Clear any error state
      setError(null);
      
    } catch (err) {
      console.error("💥 Error clearing all notifications:", err);
      
      // Revert optimistic update on failure
      setNotifications(originalNotifications);
      
      // Set error state for user feedback
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to clear notifications: ${errorMessage}`);
      
      // Re-throw for component-level error handling
      throw err;
    } finally {
      setActionLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete("clear-all");
        return newSet;
      });
    }
  }, [supabase, notifications]);

  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) return;

        // Convert client settings to database format
        const dbSettings = {
          enable_push_notifications: updatedSettings.enablePushNotifications,
          enable_email_notifications: updatedSettings.enableEmailNotifications,
          enable_study_reminders: updatedSettings.enableStudyReminders,
          enable_group_invites: updatedSettings.enableGroupInvites,
          enable_exam_reminders: updatedSettings.enableExamReminders,
          enable_achievement_notifications:
            updatedSettings.enableAchievementNotifications,
          notification_sound: updatedSettings.notificationSound,
          quiet_hours_enabled: updatedSettings.quietHours.enabled,
          quiet_hours_start: updatedSettings.quietHours.startTime,
          quiet_hours_end: updatedSettings.quietHours.endTime,
        };

        const { error } = await supabase
          .from("notification_settings")
          .upsert({ user_id: user.data.user.id, ...dbSettings });

        if (error) throw error;
      } catch (err) {
        console.error("Error updating settings:", err);
        // Keep local settings even if database update fails
      }
    },
    [settings, supabase]
  );

  // Create notification (for testing/manual creation)
  const createNotification = useCallback(
    async (
      type: Notification["type"],
      title: string,
      message: string,
      priority: Notification["priority"] = "medium",
      actionable: boolean = false,
      link?: string,
      metadata?: any
    ) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) return null;

        const { data, error } = await supabase.rpc("create_notification", {
          p_user_id: user.data.user.id,
          p_type: type,
          p_title: title,
          p_message: message,
          p_priority: priority,
          p_actionable: actionable,
          p_link: link,
          p_metadata: metadata || {},
        });

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Error creating notification:", err);
        return null;
      }
    },
    [supabase]
  );

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper functions
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

  // Migration helper - can be called to migrate localStorage data to database
  const migrateLocalStorageToDatabase = useCallback(async () => {
    try {
      const saved = localStorage.getItem("kawanstudy_notifications");
      if (!saved) return;

      const localNotifications = JSON.parse(saved);
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      for (const notification of localNotifications) {
        await createNotification(
          notification.type,
          notification.title,
          notification.message,
          notification.priority,
          notification.actionable,
          notification.link,
          notification.metadata
        );
      }

      // Clear localStorage after successful migration
      localStorage.removeItem("kawanstudy_notifications");
      console.log("Successfully migrated notifications to database");
    } catch (err) {
      console.error("Error migrating notifications:", err);
    }
  }, [createNotification, supabase]);

  return {
    notifications,
    settings,
    isLoading,
    error,
    clearError,
    actionLoading,
    unreadCount: getUnreadCount(),
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    createNotification,
    getNotificationsByType,
    getRecentNotifications,
    migrateLocalStorageToDatabase,
    // Helper functions for checking loading states
    isActionLoading: (action: string, id?: string) => {
      const key = id ? `${action}-${id}` : action;
      return actionLoading.has(key);
    },
    // Keep for backward compatibility
    simulateNewNotification: () =>
      createNotification(
        "message",
        "Test Notification",
        "This is a test notification",
        "medium",
        true
      ),
  };
}
