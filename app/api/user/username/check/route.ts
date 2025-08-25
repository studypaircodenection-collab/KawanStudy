import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        {
          available: false,
          error: "Username can only contain letters, numbers, and underscores",
        },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        {
          available: false,
          error: "Username must be between 3 and 30 characters",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if username is available using the database function
    const { data, error } = await supabase.rpc("check_username_availability", {
      username_to_check: username,
    });

    if (error) {
      console.error("Username availability check error:", error);
      return NextResponse.json(
        { error: "Failed to check username availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      username,
      available: data,
      message: data ? "Username is available" : "Username is already taken",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
