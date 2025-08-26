import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/notifications - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unread") === "true";

    const { data, error } = await supabase.rpc("get_user_notifications", {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
      p_type: type,
      p_unread_only: unreadOnly,
    });

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications: data || [] });
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      title,
      message,
      priority = "medium",
      actionable = false,
      link,
      avatar,
      metadata = {},
      groupKey,
      expiresHours,
    } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("create_notification", {
      p_user_id: user.id,
      p_type: type,
      p_title: title,
      p_message: message,
      p_priority: priority,
      p_actionable: actionable,
      p_link: link,
      p_avatar: avatar,
      p_metadata: metadata,
      p_group_key: groupKey,
      p_expires_hours: expiresHours,
    });

    if (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notificationId: data });
  } catch (error) {
    console.error("Error in POST /api/notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead = false } = body;

    const { data, error } = await supabase.rpc("mark_notifications_read", {
      p_user_id: user.id,
      p_notification_ids: markAllAsRead ? null : notificationIds,
    });

    if (error) {
      console.error("Error marking notifications as read:", error);
      return NextResponse.json(
        { error: "Failed to mark notifications as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ affectedCount: data });
  } catch (error) {
    console.error("Error in PATCH /api/notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting all notifications:", error);
        return NextResponse.json(
          { error: "Failed to delete notifications" },
          { status: 500 }
        );
      }
    } else if (notificationId) {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json(
          { error: "Failed to delete notification" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Missing notification ID or all parameter" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
