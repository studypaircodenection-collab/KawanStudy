import { createClient } from "@/lib/supabase/server";

interface SessionData {
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  user_agent?: string;
}

export class SessionService {
  /**
   * Create a new session record when user logs in
   */
  static async createSession(userId: string, sessionData: SessionData) {
    try {
      const supabase = await createClient();

      // Generate a unique session token
      const sessionToken = crypto.randomUUID();

      // Set expiration to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { data, error } = await supabase
        .from("user_sessions")
        .insert({
          user_id: userId,
          session_token: sessionToken,
          device_type: sessionData.device_type,
          browser: sessionData.browser,
          os: sessionData.os,
          ip_address: sessionData.ip_address,
          location: sessionData.location,
          user_agent: sessionData.user_agent,
          is_current: true, // Mark as current session
          last_active: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error creating session:", error);
      return { success: false, error };
    }
  }

  /**
   * Update session activity timestamp
   */
  static async updateSessionActivity(sessionId: string) {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from("user_sessions")
        .update({ last_active: new Date().toISOString() })
        .eq("id", sessionId);

      if (error) {
        console.error("Error updating session activity:", error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating session activity:", error);
      return { success: false, error };
    }
  }

  /**
   * Clean up expired sessions (older than 30 days)
   */
  static async cleanupExpiredSessions() {
    try {
      const supabase = await createClient();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .lt("last_active", thirtyDaysAgo.toISOString());

      if (error) {
        console.error("Error cleaning up expired sessions:", error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      return { success: false, error };
    }
  }

  /**
   * Extract device information from user agent
   */
  static parseUserAgent(userAgent: string): Partial<SessionData> {
    const deviceType = this.getDeviceType(userAgent);
    const browser = this.getBrowser(userAgent);
    const os = this.getOS(userAgent);

    return { device_type: deviceType, browser, os };
  }

  private static getDeviceType(userAgent: string): string {
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return "tablet";
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    ) {
      return "mobile";
    }
    return "desktop";
  }

  private static getBrowser(userAgent: string): string {
    if (userAgent.includes("Firefox")) {
      const match = userAgent.match(/Firefox\/(\d+)/);
      return match ? `Firefox ${match[1]}` : "Firefox";
    }
    if (userAgent.includes("Chrome")) {
      const match = userAgent.match(/Chrome\/(\d+)/);
      return match ? `Chrome ${match[1]}` : "Chrome";
    }
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      const match = userAgent.match(/Version\/(\d+)/);
      return match ? `Safari ${match[1]}` : "Safari";
    }
    if (userAgent.includes("Edge")) {
      const match = userAgent.match(/Edge\/(\d+)/);
      return match ? `Edge ${match[1]}` : "Edge";
    }
    return "Unknown Browser";
  }

  private static getOS(userAgent: string): string {
    if (userAgent.includes("Windows NT 10.0")) return "Windows 10/11";
    if (userAgent.includes("Windows NT")) return "Windows";
    if (userAgent.includes("Mac OS X")) {
      const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
      return match ? `macOS ${match[1].replace("_", ".")}` : "macOS";
    }
    if (userAgent.includes("iPhone OS")) {
      const match = userAgent.match(/iPhone OS (\d+[._]\d+)/);
      return match ? `iOS ${match[1].replace("_", ".")}` : "iOS";
    }
    if (userAgent.includes("Android")) {
      const match = userAgent.match(/Android (\d+\.?\d*)/);
      return match ? `Android ${match[1]}` : "Android";
    }
    if (userAgent.includes("Linux")) return "Linux";
    return "Unknown OS";
  }
}
