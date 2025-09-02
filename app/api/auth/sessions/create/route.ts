import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SessionService } from "@/lib/services/session-service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user agent and IP address from request headers
    const userAgent = request.headers.get("user-agent") || "";
    const xForwardedFor = request.headers.get("x-forwarded-for");
    const xRealIp = request.headers.get("x-real-ip");
    const ipAddress = xForwardedFor?.split(",")[0] || xRealIp || "unknown";

    // Parse device information from user agent
    const deviceInfo = SessionService.parseUserAgent(userAgent);

    // Create session record
    const sessionData = {
      device_type: deviceInfo.device_type || "unknown",
      browser: deviceInfo.browser || "Unknown Browser",
      os: deviceInfo.os || "Unknown OS",
      ip_address: ipAddress,
      location: "Unknown", // In production, you might use IP geolocation service
      user_agent: userAgent,
    };

    const result = await SessionService.createSession(user.id, sessionData);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session: result.data,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const result = await SessionService.updateSessionActivity(sessionId);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to update session activity" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating session activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
