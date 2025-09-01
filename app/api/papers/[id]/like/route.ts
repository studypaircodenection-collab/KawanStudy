import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already liked the paper
    const { data: existingLike } = await supabase
      .from("paper_likes")
      .select("id")
      .eq("paper_id", id)
      .eq("user_id", user.id)
      .single();

    if (existingLike) {
      // Unlike - remove the like
      const { error } = await supabase
        .from("paper_likes")
        .delete()
        .eq("paper_id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error removing like:", error);
        return NextResponse.json(
          { error: "Failed to remove like" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        liked: false,
        message: "Paper unliked",
      });
    } else {
      // Like - add the like
      const { error } = await supabase.from("paper_likes").insert({
        paper_id: id,
        user_id: user.id,
      });

      if (error) {
        console.error("Error adding like:", error);
        return NextResponse.json(
          { error: "Failed to add like" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        liked: true,
        message: "Paper liked",
      });
    }
  } catch (error) {
    console.error("Like paper API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        liked: false,
        likeCount: 0,
      });
    }

    // Check if user liked the paper
    const { data: like } = await supabase
      .from("paper_likes")
      .select("id")
      .eq("paper_id", id)
      .eq("user_id", user.id)
      .single();

    // Get total like count
    const { count: likeCount } = await supabase
      .from("paper_likes")
      .select("*", { count: "exact" })
      .eq("paper_id", id);

    return NextResponse.json({
      liked: !!like,
      likeCount: likeCount || 0,
    });
  } catch (error) {
    console.error("Get like status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
