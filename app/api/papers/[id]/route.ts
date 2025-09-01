import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get paper details
    const { data: paper, error } = await supabase
      .from("papers")
      .select(
        `
        id,
        user_id,
        title,
        description,
        subject,
        academic_level,
        year,
        institution,
        course_code,
        course_name,
        professor,
        semester,
        tags,
        paper_type,
        language,
        difficulty_level,
        question_file_name,
        question_file_url,
        solution_file_name,
        solution_file_url,
        has_solution,
        visibility,
        allow_download,
        allow_comments,
        source_attribution,
        source_type,
        view_count,
        download_count,
        like_count,
        comment_count,
        status,
        created_at,
        updated_at,
        profiles!papers_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error) {
      console.error("Error fetching paper:", error);
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    // Track view (similar to notes system)
    const userAgent = request.headers.get("user-agent");
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip");

    // Get current user for view tracking
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Track the view
    try {
      await supabase.rpc("track_paper_view", {
        p_paper_id: id,
        p_user_id: user?.id || null,
        p_ip_address: ip,
        p_user_agent: userAgent,
      });
    } catch (viewError) {
      console.error("Error tracking paper view:", viewError);
      // Don't fail the request if view tracking fails
    }

    // Transform data
    const transformedPaper = {
      id: paper.id,
      title: paper.title,
      description: paper.description,
      subject: paper.subject,
      academicLevel: paper.academic_level,
      year: paper.year,
      institution: paper.institution,
      courseCode: paper.course_code,
      courseName: paper.course_name,
      professor: paper.professor,
      semester: paper.semester,
      tags: paper.tags || [],
      paperType: paper.paper_type,
      language: paper.language,
      difficultyLevel: paper.difficulty_level,
      questionFileName: paper.question_file_name,
      questionFileUrl: paper.question_file_url,
      solutionFileName: paper.solution_file_name,
      solutionFileUrl: paper.solution_file_url,
      hasSolution: paper.has_solution,
      visibility: paper.visibility,
      allowDownload: paper.allow_download,
      allowComments: paper.allow_comments,
      sourceAttribution: paper.source_attribution,
      sourceType: paper.source_type,
      viewCount: paper.view_count,
      downloadCount: paper.download_count,
      likeCount: paper.like_count,
      commentCount: paper.comment_count,
      status: paper.status,
      createdAt: paper.created_at,
      updatedAt: paper.updated_at,
      userProfile: paper.profiles
        ? {
            id: (paper.profiles as any).id,
            username: (paper.profiles as any).username,
            fullName: (paper.profiles as any).full_name,
            avatarUrl: (paper.profiles as any).avatar_url,
          }
        : {
            id: paper.user_id || 'unknown',
            username: 'Unknown User',
            fullName: 'Unknown User',
            avatarUrl: undefined,
          },
    };

    return NextResponse.json({ paper: transformedPaper });
  } catch (error) {
    console.error("Paper detail API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const data = await request.json();

    // Check if user owns the paper
    const { data: existingPaper, error: fetchError } = await supabase
      .from("papers")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingPaper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    if (existingPaper.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update paper
    const { data: updatedPaper, error } = await supabase
      .from("papers")
      .update({
        title: data.title,
        description: data.description,
        subject: data.subject,
        academic_level: data.academicLevel,
        year: data.year,
        institution: data.institution,
        course_code: data.courseCode,
        course_name: data.courseName,
        professor: data.professor,
        semester: data.semester,
        tags: data.tags || [],
        paper_type: data.paperType,
        language: data.language,
        difficulty_level: data.difficultyLevel,
        solution_file_name: data.solutionFileName,
        solution_file_size: data.solutionFileSize,
        solution_file_url: data.solutionFileUrl,
        solution_file_path: data.solutionFilePath,
        has_solution: data.hasSolution || false,
        visibility: data.visibility,
        allow_download: data.allowDownload,
        allow_comments: data.allowComments,
        source_attribution: data.sourceAttribution,
        source_type: data.sourceType,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating paper:", error);
      return NextResponse.json(
        { error: "Failed to update paper" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paper: updatedPaper,
    });
  } catch (error) {
    console.error("Update paper API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user owns the paper
    const { data: existingPaper, error: fetchError } = await supabase
      .from("papers")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingPaper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    if (existingPaper.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete paper
    const { error } = await supabase.from("papers").delete().eq("id", id);

    if (error) {
      console.error("Error deleting paper:", error);
      return NextResponse.json(
        { error: "Failed to delete paper" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete paper API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
