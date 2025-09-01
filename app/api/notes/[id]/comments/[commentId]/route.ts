import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/notes/[id]/comments/[commentId] - Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const supabase = await createClient();
    const noteId = params.id;
    const commentId = params.commentId;

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Comment is too long (maximum 1000 characters)" },
        { status: 400 }
      );
    }

    // Check if comment exists and user owns it
    const { data: comment, error: commentError } = await supabase
      .from("note_comments")
      .select("*")
      .eq("id", commentId)
      .eq("note_id", noteId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { error: "Comment not found or access denied" },
        { status: 404 }
      );
    }

    // Update comment
    const { data: updatedComment, error: updateError } = await supabase
      .from("note_comments")
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        parent_id,
        user_id,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Error updating comment:", updateError);
      return NextResponse.json(
        { error: "Failed to update comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const supabase = await createClient();
    const noteId = params.id;
    const commentId = params.commentId;

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if comment exists and user owns it
    const { data: comment, error: commentError } = await supabase
      .from("note_comments")
      .select("id, user_id, parent_id")
      .eq("id", commentId)
      .eq("note_id", noteId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { error: "Comment not found or access denied" },
        { status: 404 }
      );
    }

    // Check if comment has replies
    const { data: replies, error: repliesError } = await supabase
      .from("note_comments")
      .select("id")
      .eq("parent_id", commentId)
      .eq("status", "active");

    if (repliesError) {
      console.error("Error checking replies:", repliesError);
      return NextResponse.json(
        { error: "Failed to check comment replies" },
        { status: 500 }
      );
    }

    // If comment has replies, mark as deleted instead of actually deleting
    if (replies && replies.length > 0) {
      const { error: updateError } = await supabase
        .from("note_comments")
        .update({
          content: "[This comment has been deleted]",
          status: "deleted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId);

      if (updateError) {
        console.error("Error marking comment as deleted:", updateError);
        return NextResponse.json(
          { error: "Failed to delete comment" },
          { status: 500 }
        );
      }
    } else {
      // Actually delete the comment if no replies
      const { error: deleteError } = await supabase
        .from("note_comments")
        .delete()
        .eq("id", commentId);

      if (deleteError) {
        console.error("Error deleting comment:", deleteError);
        return NextResponse.json(
          { error: "Failed to delete comment" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
