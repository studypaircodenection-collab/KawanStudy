import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PaperDetailView } from "@/components/papers/paper-detail-view";

interface PaperPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      notFound();
    }

    // Fetch paper details directly from database
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

    if (error || !paper) {
      console.error("Error fetching paper:", error);
      notFound();
    }

    // Check if user can view this paper
    if (paper.visibility === "private" && paper.user_id !== user.id) {
      notFound();
    }

    // Transform data to match expected format
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
      userProfile: (() => {
        const profile = Array.isArray(paper.profiles)
          ? paper.profiles[0]
          : paper.profiles;
        return profile
          ? {
              id: profile.id,
              username: profile.username,
              fullName: profile.full_name,
              avatarUrl: profile.avatar_url,
            }
          : {
              id: paper.user_id,
              username: "Unknown User",
              fullName: "Unknown User",
              avatarUrl: null,
            };
      })(),
    };

    return <PaperDetailView paper={transformedPaper} />;
  } catch (error) {
    console.error("Error fetching paper:", error);
    notFound();
  }
}
