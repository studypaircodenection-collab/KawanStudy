import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Quiz, Question, QuestionKind } from "@/types/quiz";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/quiz/[id] - Get a specific quiz with questions
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get quiz with questions using the database function
    console.log("Fetching quiz with ID:", id);
    console.log("User ID:", user.id);

    const { data: quizData, error } = await supabase.rpc(
      "get_quiz_with_questions",
      { p_quiz_id: id }
    );

    console.log("Quiz data response:", quizData);
    console.log("Quiz error:", error);

    if (error) {
      console.error("Error fetching quiz:", error);
      return NextResponse.json(
        { error: "Failed to fetch quiz" },
        { status: 500 }
      );
    }

    if (!quizData || !quizData.quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get creator information
    const { data: creator, error: creatorError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .eq("id", quizData.quiz.created_by)
      .single();

    if (creatorError) {
      console.warn("Failed to fetch creator info:", creatorError);
    }

    // Get user's attempts for this quiz
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", id)
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (attemptsError) {
      console.warn("Failed to fetch user attempts:", attemptsError);
    }

    // Transform questions to match frontend interface
    const transformedQuestions: Question[] = (quizData.questions || []).map(
      (q: any) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correct:
          q.kind === "multiple"
            ? q.correct
            : q.correct && q.correct[0] !== undefined
            ? q.correct[0]
            : 0,
        kind: q.kind as QuestionKind,
        explanation: q.explanation,
        tags: q.tags,
        timeLimitSeconds: q.timeLimitSeconds,
      })
    );

    // Transform quiz to match frontend interface
    const transformedQuiz: Quiz & {
      createdBy?: any;
      isOwner?: boolean;
      attemptsCount?: number;
      bestScore?: number;
    } = {
      id: quizData.quiz.id,
      title: quizData.quiz.title,
      description: quizData.quiz.description || "",
      thumbnailUrl: quizData.quiz.thumbnail_url || "",
      subject: quizData.quiz.subject,
      gradeLevel: quizData.quiz.grade_level || "",
      playCount: quizData.quiz.play_count || 0,
      timeLimitMinutes: quizData.quiz.time_limit_minutes,
      shuffle: quizData.quiz.shuffle_questions || false,
      metadata: quizData.quiz.metadata || {},
      questions: transformedQuestions,
      createdBy: creator,
      isOwner: quizData.quiz.created_by === user.id,
      attemptsCount: attempts?.length || 0,
      bestScore:
        attempts && attempts.length > 0
          ? Math.max(...attempts.map((a: any) => a.percentage))
          : undefined,
    };

    return NextResponse.json({
      success: true,
      data: transformedQuiz,
    });
  } catch (error) {
    console.error("Error in quiz GET by ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/quiz/[id] - Update a specific quiz
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns this quiz
    const { data: existingQuiz, error: checkError } = await supabase
      .from("quizzes")
      .select("created_by")
      .eq("id", id)
      .single();

    if (checkError || !existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (existingQuiz.created_by !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this quiz" },
        { status: 403 }
      );
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

    // Update quiz
    const { error: quizError } = await supabase
      .from("quizzes")
      .update({
        title,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        subject,
        grade_level: gradeLevel || null,
        time_limit_minutes: timeLimitMinutes || null,
        shuffle_questions: shuffle || false,
        metadata: metadata || {},
      })
      .eq("id", id);

    if (quizError) {
      console.error("Error updating quiz:", quizError);
      return NextResponse.json(
        { error: "Failed to update quiz" },
        { status: 500 }
      );
    }

    // Delete existing questions
    const { error: deleteError } = await supabase
      .from("quiz_questions")
      .delete()
      .eq("quiz_id", id);

    if (deleteError) {
      console.error("Error deleting old questions:", deleteError);
      return NextResponse.json(
        { error: "Failed to update quiz questions" },
        { status: 500 }
      );
    }

    // Insert new questions
    const questionsToInsert = questions.map((question: any, index: number) => ({
      quiz_id: id,
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
    }));

    const { error: questionsError } = await supabase
      .from("quiz_questions")
      .insert(questionsToInsert);

    if (questionsError) {
      console.error("Error creating new questions:", questionsError);
      return NextResponse.json(
        { error: "Failed to update quiz questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quiz updated successfully",
    });
  } catch (error) {
    console.error("Error in quiz PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/quiz/[id] - Delete a specific quiz
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns this quiz
    const { data: existingQuiz, error: checkError } = await supabase
      .from("quizzes")
      .select("created_by, title")
      .eq("id", id)
      .single();

    if (checkError || !existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (existingQuiz.created_by !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this quiz" },
        { status: 403 }
      );
    }

    // Delete quiz (cascade will delete questions and attempts)
    const { error: deleteError } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting quiz:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete quiz" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error in quiz DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
