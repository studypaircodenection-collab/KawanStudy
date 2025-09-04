import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { room_id, user_id, left_at, connection_status } =
      await request.json();

    const supabase = await createClient();

    // Update participant status
    const { error } = await supabase
      .from("video_room_participants")
      .update({
        left_at,
        connection_status,
      })
      .eq("room_id", room_id)
      .eq("user_id", user_id);

    if (error) {
      console.error("❌ Error updating participant status:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ User ${user_id} left room ${room_id} via API cleanup`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error in leave-room API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
