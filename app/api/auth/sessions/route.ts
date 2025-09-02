import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get sessions from database using the database function
    const { data: sessions, error } = await supabase.rpc("get_user_sessions", {
      user_id_param: user.id,
    });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: sessions || [] });
  } catch (error) {
    console.error("Error fetching sessions:", error);
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

    if (sessionId === "current") {
      // If deleting current session, sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Sign out error:", signOutError);
        return NextResponse.json(
          { error: "Failed to sign out" },
          { status: 500 }
        );
      }
    } else {
      // Delete the specific session from the database
      const { error } = await supabase.rpc("delete_user_session", {
        session_id_param: sessionId,
        user_id_param: user.id,
      });

      if (error) {
        console.error("Database error:", error);
        return NextResponse.json(
          { error: "Failed to delete session" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
