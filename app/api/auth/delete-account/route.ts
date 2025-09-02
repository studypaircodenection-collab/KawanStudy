import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { confirmText } = await request.json();

    if (confirmText !== "DELETE") {
      return NextResponse.json(
        { error: "Confirmation text must be 'DELETE'" },
        { status: 400 }
      );
    }

    // Delete user data from all tables
    const deleteOperations = [
      // Delete user's notes
      supabase.from("notes").delete().eq("user_id", user.id),

      // Delete user's quizzes
      supabase.from("quizzes").delete().eq("created_by", user.id),

      // Delete user's quiz attempts
      supabase.from("quiz_attempts").delete().eq("user_id", user.id),

      // Delete user's peer connections
      supabase
        .from("peer_connections")
        .delete()
        .or(`user_id.eq.${user.id},peer_id.eq.${user.id}`),

      // Delete user's messages
      supabase.from("messages").delete().eq("sender_id", user.id),

      // Delete user's notifications
      supabase.from("notifications").delete().eq("user_id", user.id),

      // Delete user's achievements
      supabase.from("user_achievements").delete().eq("user_id", user.id),

      // Delete user's schedule items
      supabase.from("schedule_items").delete().eq("user_id", user.id),

      // Delete user's profile
      supabase.from("profiles").delete().eq("id", user.id),
    ];

    // Execute all delete operations
    const results = await Promise.allSettled(deleteOperations);

    // Check if any operations failed
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length > 0) {
      console.error("Some delete operations failed:", failures);
      // Continue with auth deletion even if some data deletion failed
    }

    // Finally, delete the auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Account deleted successfully",
      deletedData: {
        userId: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
