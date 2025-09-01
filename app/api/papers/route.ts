import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const subject = searchParams.get("subject");
    const year = searchParams.get("year");
    const academicLevel = searchParams.get("academic_level");
    const paperType = searchParams.get("paper_type");
    const search = searchParams.get("search");
    const hasSolution = searchParams.get("has_solution");
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort_order") || "desc";

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("papers")
      .select(
        `
        id,
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
      .eq("status", "published")
      .eq("visibility", "public");

    // Apply filters
    if (subject) {
      query = query.eq("subject", subject);
    }

    if (year) {
      query = query.eq("year", parseInt(year));
    }

    if (academicLevel) {
      query = query.eq("academic_level", academicLevel);
    }

    if (paperType) {
      query = query.eq("paper_type", paperType);
    }

    if (hasSolution === "true") {
      query = query.eq("has_solution", true);
    } else if (hasSolution === "false") {
      query = query.eq("has_solution", false);
    }

    // Apply search
    if (search) {
      query = query.textSearch("fts", search);
    }

    // Apply sorting
    const validSortFields = [
      "created_at",
      "view_count",
      "like_count",
      "download_count",
      "year",
      "title",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const order =
      sortOrder === "asc" ? { ascending: true } : { ascending: false };

    query = query.order(sortField, order);

    // Get total count for pagination
    const { count } = await supabase
      .from("papers")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .eq("visibility", "public");

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: papers, error } = await query;

    if (error) {
      console.error("Error fetching papers:", error);
      return NextResponse.json(
        { error: "Failed to fetch papers" },
        { status: 500 }
      );
    }

    // Transform data
    const transformedPapers =
      papers?.map((paper: any) => ({
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
              id: paper.profiles.id,
              username: paper.profiles.username,
              fullName: paper.profiles.full_name,
              avatarUrl: paper.profiles.avatar_url,
            }
          : null,
      })) || [];

    return NextResponse.json({
      papers: transformedPapers,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Papers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    const requiredFields = [
      "title",
      "subject",
      "academicLevel",
      "year",
      "paperType",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Insert paper
    const { data: paper, error } = await supabase
      .from("papers")
      .insert({
        user_id: user.id,
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
        language: data.language || "english",
        difficulty_level: data.difficultyLevel || "intermediate",
        question_file_name: data.questionFileName,
        question_file_size: data.questionFileSize,
        question_file_url: data.questionFileUrl,
        question_file_path: data.questionFilePath,
        solution_file_name: data.solutionFileName,
        solution_file_size: data.solutionFileSize,
        solution_file_url: data.solutionFileUrl,
        solution_file_path: data.solutionFilePath,
        has_solution: data.hasSolution || false,
        visibility: data.visibility || "public",
        allow_download: data.allowDownload !== false,
        allow_comments: data.allowComments !== false,
        source_attribution: data.sourceAttribution,
        source_type: data.sourceType || "original",
        status: "published",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating paper:", error);
      return NextResponse.json(
        { error: "Failed to create paper" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paper: {
        id: paper.id,
        title: paper.title,
        // ... transform other fields as needed
      },
    });
  } catch (error) {
    console.error("Create paper API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
