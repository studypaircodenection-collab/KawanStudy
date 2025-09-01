import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Check if paper allows comments
    const { data: paper } = await supabase
      .from("papers")
      .select("allow_comments")
      .eq("id", id)
      .single();

    if (!paper?.allow_comments) {
      return NextResponse.json(
        { error: "Comments not allowed for this paper" },
        { status: 403 }
      );
    }

    // Get comments with user profiles
    const {
      data: comments,
      error,
      count,
    } = await supabase
      .from("paper_comments")
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        profiles!paper_comments_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .eq("paper_id", id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    // Transform comments
    const transformedComments =
      comments?.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        userProfile: comment.profiles
          ? {
              id: (comment.profiles as any).id,
              username: (comment.profiles as any).username,
              fullName: (comment.profiles as any).full_name,
              avatarUrl: (comment.profiles as any).avatar_url,
            }
          : null,
      })) || [];

    return NextResponse.json({
      comments: transformedComments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get comments API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await request.json();
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Comment is too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // Check if paper exists and allows comments
    const { data: paper } = await supabase
      .from("papers")
      .select("allow_comments")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    if (!paper.allow_comments) {
      return NextResponse.json(
        { error: "Comments not allowed for this paper" },
        { status: 403 }
      );
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from("paper_comments")
      .insert({
        paper_id: id,
        user_id: user.id,
        content: content.trim(),
      })
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        profiles!paper_comments_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    // Transform comment
    const transformedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      userProfile: comment.profiles
        ? {
            id: (comment.profiles as any).id,
            username: (comment.profiles as any).username,
            fullName: (comment.profiles as any).full_name,
            avatarUrl: (comment.profiles as any).avatar_url,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      comment: transformedComment,
    });
  } catch (error) {
    console.error("Create comment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
