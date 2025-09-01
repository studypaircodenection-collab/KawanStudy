import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/notes/[id]/comments - Get comments for a note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const noteId = id;

    // Get comments with user profiles (including deleted ones that have replies)
    const { data: comments, error } = await supabase
      .from("note_comments")
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        parent_id,
        user_id,
        status,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("note_id", noteId)
      .in("status", ["active", "deleted"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    // Organize comments into threads (parent-child relationships)
    const commentsMap = new Map();
    const rootComments: any[] = [];

    // First pass: create map of all comments
    comments?.forEach((comment) => {
      commentsMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into parent-child structure
    comments?.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentsMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentsMap.get(comment.id));
        }
      } else {
        rootComments.push(commentsMap.get(comment.id));
      }
    });

    return NextResponse.json({
      comments: rootComments,
      total: comments?.length || 0,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notes/[id]/comments - Add a comment to a note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const noteId = id;

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, parentId } = body;

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

    // Check if note exists and allows comments
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, allow_comments, status, visibility")
      .eq("id", noteId)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!note.allow_comments) {
      return NextResponse.json(
        { error: "Comments are not allowed on this note" },
        { status: 403 }
      );
    }

    if (note.status !== "published") {
      return NextResponse.json(
        { error: "Cannot comment on unpublished notes" },
        { status: 403 }
      );
    }

    // If it's a reply, check if parent comment exists
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from("note_comments")
        .select("id")
        .eq("id", parentId)
        .eq("note_id", noteId)
        .eq("status", "active")
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    // Create comment
    const { data: comment, error: insertError } = await supabase
      .from("note_comments")
      .insert({
        note_id: noteId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
        status: "active",
      })
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

    if (insertError) {
      console.error("Error creating comment:", insertError);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
