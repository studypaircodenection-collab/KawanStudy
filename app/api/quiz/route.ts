import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Quiz, Question, QuestionKind } from "@/types/quiz";

// GET /api/quiz - Get all quizzes with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const subject = searchParams.get("subject");
    const gradeLevel = searchParams.get("gradeLevel");
    const search = searchParams.get("search");
    const createdBy = searchParams.get("createdBy"); // For getting user's own quizzes

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("quizzes")
      .select(
        `
        *,
        profiles:created_by (
          id,
          username,
          full_name,
          avatar_url
        ),
        quiz_questions (count)
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (subject) {
      query = query.eq("subject", subject);
    }

    if (gradeLevel) {
      query = query.eq("grade_level", gradeLevel);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (createdBy) {
      query = query.eq("created_by", createdBy);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from("quizzes")
      .select("*", { count: "exact", head: true })
      .match(subject ? { subject } : {})
      .match(gradeLevel ? { grade_level: gradeLevel } : {})
      .match(createdBy ? { created_by: createdBy } : {});

    // Get paginated results
    const { data: quizzes, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching quizzes:", error);
      return NextResponse.json(
        { error: "Failed to fetch quizzes" },
        { status: 500 }
      );
    }

    // Transform data to match frontend interface
    const transformedQuizzes: Quiz[] = quizzes.map((quiz: any) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || "",
      thumbnailUrl: quiz.thumbnail_url || "",
      subject: quiz.subject,
      gradeLevel: quiz.grade_level || "",
      playCount: quiz.play_count || 0,
      timeLimitMinutes: quiz.time_limit_minutes,
      shuffle: quiz.shuffle_questions || false,
      metadata: quiz.metadata || {},
      questions: [], // Questions will be loaded separately when needed
      createdBy: quiz.profiles,
      createdAt: quiz.created_at,
      updatedAt: quiz.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedQuizzes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in quiz GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/quiz - Create a new quiz
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

    const body = await request.json();
    const {
      title,
      description,
      thumbnailUrl,
      subject,
      gradeLevel,
      timeLimitMinutes,
      shuffle,
      questions,
      metadata,
    } = body;

    // Validate required fields
    if (!title || !subject || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: title, subject, and questions" },
        { status: 400 }
      );
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text || question.text.trim() === "") {
        return NextResponse.json(
          { error: `Question ${i + 1} text is required` },
          { status: 400 }
        );
      }
      if (!question.options || question.options.length < 2) {
        return NextResponse.json(
          { error: `Question ${i + 1} must have at least 2 options` },
          { status: 400 }
        );
      }
    }

    // Start a transaction
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        title,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        subject,
        grade_level: gradeLevel || null,
        time_limit_minutes: timeLimitMinutes || null,
        shuffle_questions: shuffle || false,
        metadata: metadata || {},
        created_by: user.id,
      })
      .select()
      .single();

    if (quizError) {
      console.error("Error creating quiz:", quizError);
      return NextResponse.json(
        { error: "Failed to create quiz" },
        { status: 500 }
      );
    }

    // Insert questions
    const questionsToInsert = questions.map((question: any, index: number) => {
      console.log("Processing question:", {
        index,
        question,
        question_text: question.text,
        question_type: question.kind || "single",
        options: question.options,
        correct_answers: Array.isArray(question.correct)
          ? question.correct
          : [question.correct],
      });

      return {
        quiz_id: quiz.id,
        question_text: question.text,
        question_type: question.kind || "single",
        options: question.options,
        correct_answers: Array.isArray(question.correct)
          ? question.correct
          : [question.correct],
        explanation: question.explanation || null,
        tags: question.tags || null,
        time_limit_seconds: question.timeLimitSeconds || null,
        order_index: index + 1,
      };
    });

    console.log("Questions to insert:", questionsToInsert);

    const { error: questionsError } = await supabase
      .from("quiz_questions")
      .insert(questionsToInsert);

    if (questionsError) {
      console.error("Error creating questions:", questionsError);
      // Rollback quiz creation
      await supabase.from("quizzes").delete().eq("id", quiz.id);
      return NextResponse.json(
        { error: "Failed to create quiz questions" },
        { status: 500 }
      );
    }

    // Award points for creating a quiz
    try {
      await supabase.rpc("add_points_to_user", {
        p_user_id: user.id,
        p_points: 25,
        p_source: "quiz_creation",
        p_source_id: quiz.id,
        p_description: `Created quiz: ${title}`,
      });
    } catch (pointsError) {
      console.warn("Failed to award points for quiz creation:", pointsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: quiz.id,
        message: "Quiz created successfully",
      },
    });
  } catch (error) {
    console.error("Error in quiz POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
