import type { PeerUser, ConnectionRequest } from "@/lib/types";

interface PeerSearchParams {
  searchQuery?: string;
  limit?: number;
  discover?: boolean;
}

interface PeerAPIResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
  message?: string;
}

export class PeerService {
  private static baseUrl = "/api/peer";

  // Search for peers
  static async searchPeers(params: PeerSearchParams = {}): Promise<PeerUser[]> {
    const searchParams = new URLSearchParams({
      action: "search",
      search: params.searchQuery || "",
      limit: (params.limit || 50).toString(),
    });

    // Add discover parameter if specified
    if (params.discover) {
      searchParams.set("discover", "true");
    }

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const result: PeerAPIResponse<PeerUser[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to search peers");
    }

    return result.data || [];
  }

  // Get user's connections
  static async getConnections(
    status: "accepted" | "pending" | "blocked" = "accepted"
  ): Promise<PeerUser[]> {
    const searchParams = new URLSearchParams({
      action: "connections",
      status,
    });

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const result: PeerAPIResponse<PeerUser[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch connections");
    }

    return result.data || [];
  }

  // Get pending requests (received)
  static async getPendingRequests(): Promise<PeerUser[]> {
    const searchParams = new URLSearchParams({
      action: "requests",
    });

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const result: PeerAPIResponse<PeerUser[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch pending requests");
    }

    return result.data || [];
  }

  // Get sent requests
  static async getSentRequests(): Promise<PeerUser[]> {
    const searchParams = new URLSearchParams({
      action: "sent",
    });

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const result: PeerAPIResponse<PeerUser[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch sent requests");
    }

    return result.data || [];
  }

  // Send connection request
  static async sendConnectionRequest(
    targetUserId: string,
    message?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "connect",
        targetUserId,
        message,
      }),
    });

    const result: PeerAPIResponse<any> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to send connection request");
    }

    return {
      success: result.success || false,
      message: result.message || "Connection request sent",
    };
  }

  // Accept connection request
  static async acceptConnectionRequest(
    connectionId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "accept",
        targetUserId: connectionId, // connection ID in this case
      }),
    });

    const result: PeerAPIResponse<any> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to accept connection request");
    }

    return {
      success: result.success || false,
      message: result.message || "Connection request accepted",
    };
  }

  // Decline connection request
  static async declineConnectionRequest(
    connectionId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "decline",
        targetUserId: connectionId, // connection ID in this case
      }),
    });

    const result: PeerAPIResponse<any> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to decline connection request");
    }

    return {
      success: result.success || false,
      message: result.message || "Connection request declined",
    };
  }

  // Block user
  static async blockUser(
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "block",
        targetUserId,
      }),
    });

    const result: PeerAPIResponse<any> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to block user");
    }

    return {
      success: result.success || false,
      message: result.message || "User blocked",
    };
  }

  // Unblock user
  static async unblockUser(
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "unblock",
        targetUserId,
      }),
    });

    const result: PeerAPIResponse<any> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to unblock user");
    }

    return {
      success: result.success || false,
      message: result.message || "User unblocked",
    };
  }

  // Get blocked users
  static async getBlockedUsers(): Promise<PeerUser[]> {
    const searchParams = new URLSearchParams({
      action: "blocked",
    });

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const result: PeerAPIResponse<PeerUser[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch blocked users");
    }

    return result.data || [];
  }

  // Remove connection
  static async removeConnection(
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const searchParams = new URLSearchParams({
      targetUserId,
    });

    const response = await fetch(`${this.baseUrl}?${searchParams}`, {
      method: "DELETE",
    });

    const result: PeerAPIResponse<any> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to remove connection");
    }

    return {
      success: result.success || false,
      message: result.message || "Connection removed",
    };
  }

  // Check connection status between current user and target user
  static async getConnectionStatus(targetUserId: string): Promise<{
    status:
      | "none"
      | "pending_sent"
      | "pending_received"
      | "connected"
      | "blocked";
    connectionId?: string;
  }> {
    const searchParams = new URLSearchParams({
      action: "status",
      targetUserId,
    });

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const result: PeerAPIResponse<{
      status:
        | "none"
        | "pending_sent"
        | "pending_received"
        | "connected"
        | "blocked";
      connectionId?: string;
    }> = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to get connection status");
    }

    return result.data || { status: "none" };
  }
}
