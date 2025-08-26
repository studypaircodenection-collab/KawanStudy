import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
    const action = searchParams.get("action");
    const searchQuery = searchParams.get("search") || "";
    const status = searchParams.get("status") || "accepted";
    const limit = parseInt(searchParams.get("limit") || "50");

    switch (action) {
      case "search":
        // Search for peers with connection status (for discover tab - excludes connected/blocked)
        const isDiscoverMode = searchParams.get("discover") === "true";
        const functionName = isDiscoverMode
          ? "search_peers_discover"
          : "search_peers";

        const { data: peers, error: searchError } = await supabase.rpc(
          functionName,
          {
            search_query: searchQuery,
            current_user_id: user.id,
            limit_count: limit,
          }
        );

        if (searchError) {
          console.error("Error searching peers:", searchError);
          return NextResponse.json(
            { error: "Failed to search peers" },
            { status: 500 }
          );
        }

        return NextResponse.json({ data: peers });

      case "blocked":
        // Get blocked users
        const { data: blockedUsers, error: blockedError } = await supabase.rpc(
          "get_blocked_users",
          {
            user_id: user.id,
          }
        );

        if (blockedError) {
          console.error("Error fetching blocked users:", blockedError);
          return NextResponse.json(
            { error: "Failed to fetch blocked users" },
            { status: 500 }
          );
        }

        return NextResponse.json({ data: blockedUsers });

      case "connections":
        // Get user's connections by status
        const { data: connections, error: connectionsError } =
          await supabase.rpc("get_user_connections", {
            user_id: user.id,
            status_filter: status,
          });

        if (connectionsError) {
          console.error("Error fetching connections:", connectionsError);
          return NextResponse.json(
            { error: "Failed to fetch connections" },
            { status: 500 }
          );
        }

        return NextResponse.json({ data: connections });

      case "requests":
        // Get pending connection requests (received)
        const { data: requests, error: requestsError } = await supabase
          .from("peer_connections")
          .select(
            `
            id,
            requester_id,
            message,
            created_at,
            requester:profiles!requester_id(
              id,
              username,
              full_name,
              avatar_url,
              university,
              major,
              year_of_study,
              bio,
              location,
              is_online,
              last_seen
            )
          `
          )
          .eq("addressee_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (requestsError) {
          console.error("Error fetching requests:", requestsError);
          return NextResponse.json(
            { error: "Failed to fetch requests" },
            { status: 500 }
          );
        }

        // Transform data for frontend
        const formattedRequests =
          requests?.map((req) => ({
            id: (req.requester as any)?.id,
            username: (req.requester as any)?.username,
            full_name: (req.requester as any)?.full_name,
            avatar_url: (req.requester as any)?.avatar_url,
            university: (req.requester as any)?.university,
            major: (req.requester as any)?.major,
            year_of_study: (req.requester as any)?.year_of_study,
            bio: (req.requester as any)?.bio,
            location: (req.requester as any)?.location,
            connection_status: "pending_received",
            mutual_connections: 0, // Could be calculated separately
            is_online: (req.requester as any)?.is_online || false,
            last_seen: (req.requester as any)?.last_seen,
            request_id: req.id,
            request_message: req.message,
            request_date: req.created_at,
          })) || [];

        return NextResponse.json({ data: formattedRequests });

      case "sent":
        // Get sent connection requests
        const { data: sentRequests, error: sentError } = await supabase
          .from("peer_connections")
          .select(
            `
            id,
            addressee_id,
            message,
            created_at,
            addressee:profiles!addressee_id(
              id,
              username,
              full_name,
              avatar_url,
              university,
              major,
              year_of_study,
              bio,
              location,
              is_online,
              last_seen
            )
          `
          )
          .eq("requester_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (sentError) {
          console.error("Error fetching sent requests:", sentError);
          return NextResponse.json(
            { error: "Failed to fetch sent requests" },
            { status: 500 }
          );
        }

        // Transform data for frontend
        const formattedSentRequests =
          sentRequests?.map((req) => ({
            id: (req.addressee as any)?.id,
            username: (req.addressee as any)?.username,
            full_name: (req.addressee as any)?.full_name,
            avatar_url: (req.addressee as any)?.avatar_url,
            university: (req.addressee as any)?.university,
            major: (req.addressee as any)?.major,
            year_of_study: (req.addressee as any)?.year_of_study,
            bio: (req.addressee as any)?.bio,
            location: (req.addressee as any)?.location,
            connection_status: "pending_sent",
            mutual_connections: 0, // Could be calculated separately
            is_online: (req.addressee as any)?.is_online || false,
            last_seen: (req.addressee as any)?.last_seen,
            request_id: req.id,
            request_message: req.message,
            request_date: req.created_at,
          })) || [];

        return NextResponse.json({ data: formattedSentRequests });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in peer API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { action, targetUserId, message } = body;

    switch (action) {
      case "connect":
        // Send connection request
        const { data: connectResult, error: connectError } = await supabase.rpc(
          "send_connection_request",
          {
            target_user_id: targetUserId,
            request_message: message || null,
          }
        );

        if (connectError) {
          console.error("Error sending connection request:", connectError);
          return NextResponse.json(
            { error: "Failed to send connection request" },
            { status: 500 }
          );
        }

        return NextResponse.json(connectResult);

      case "accept":
        // Accept connection request
        const { data: acceptResult, error: acceptError } = await supabase.rpc(
          "respond_to_connection_request",
          {
            connection_id: targetUserId, // In this case, targetUserId is actually connection_id
            response: "accept",
          }
        );

        if (acceptError) {
          console.error("Error accepting connection:", acceptError);
          return NextResponse.json(
            { error: "Failed to accept connection" },
            { status: 500 }
          );
        }

        return NextResponse.json(acceptResult);

      case "decline":
        // Decline connection request
        const { data: declineResult, error: declineError } = await supabase.rpc(
          "respond_to_connection_request",
          {
            connection_id: targetUserId, // In this case, targetUserId is actually connection_id
            response: "decline",
          }
        );

        if (declineError) {
          console.error("Error declining connection:", declineError);
          return NextResponse.json(
            { error: "Failed to decline connection" },
            { status: 500 }
          );
        }

        return NextResponse.json(declineResult);

      case "block":
        // Block user
        const { error: blockError } = await supabase
          .from("peer_connections")
          .upsert(
            {
              requester_id: user.id,
              addressee_id: targetUserId,
              status: "blocked",
            },
            {
              onConflict: "requester_id,addressee_id",
            }
          );

        if (blockError) {
          console.error("Error blocking user:", blockError);
          return NextResponse.json(
            { error: "Failed to block user" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "User blocked successfully",
        });

      case "unblock":
        // Unblock user
        const { error: unblockError } = await supabase
          .from("peer_connections")
          .delete()
          .eq("requester_id", user.id)
          .eq("addressee_id", targetUserId)
          .eq("status", "blocked");

        if (unblockError) {
          console.error("Error unblocking user:", unblockError);
          return NextResponse.json(
            { error: "Failed to unblock user" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "User unblocked successfully",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in peer POST API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const targetUserId = searchParams.get("targetUserId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    // Remove connection
    const { error: deleteError } = await supabase
      .from("peer_connections")
      .delete()
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`
      );

    if (deleteError) {
      console.error("Error removing connection:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove connection" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Error in peer DELETE API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
