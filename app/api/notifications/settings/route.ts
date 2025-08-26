import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/notifications/settings - Get user notification settings
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc(
      "get_user_notification_settings",
      {
        p_user_id: user.id,
      }
    );

    if (error) {
      console.error("Error fetching notification settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    const settings = data && data.length > 0 ? data[0] : null;
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error in GET /api/notifications/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/settings - Update user notification settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await request.json();

    // Convert client settings to database format
    const dbSettings = {
      user_id: user.id,
      enable_push_notifications: settings.enablePushNotifications,
      enable_email_notifications: settings.enableEmailNotifications,
      enable_study_reminders: settings.enableStudyReminders,
      enable_group_invites: settings.enableGroupInvites,
      enable_exam_reminders: settings.enableExamReminders,
      enable_achievement_notifications: settings.enableAchievementNotifications,
      enable_message_notifications: settings.enableMessageNotifications,
      enable_system_notifications: settings.enableSystemNotifications,
      enable_schedule_notifications: settings.enableScheduleNotifications,
      notification_sound: settings.notificationSound,
      quiet_hours_enabled: settings.quietHours?.enabled,
      quiet_hours_start: settings.quietHours?.startTime,
      quiet_hours_end: settings.quietHours?.endTime,
      enable_notification_grouping: settings.enableNotificationGrouping,
      max_notifications_per_hour: settings.maxNotificationsPerHour,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("notification_settings")
      .upsert(dbSettings);

    if (error) {
      console.error("Error updating notification settings:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/notifications/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
