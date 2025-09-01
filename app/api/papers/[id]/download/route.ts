import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { fileType } = await request.json(); // 'question' or 'solution'
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get paper details
    const { data: paper, error: paperError } = await supabase
      .from("papers")
      .select("question_file_url, solution_file_url, allow_download")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (paperError || !paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    if (!paper.allow_download) {
      return NextResponse.json(
        { error: "Downloads not allowed for this paper" },
        { status: 403 }
      );
    }

    let fileUrl = "";
    if (fileType === "question") {
      fileUrl = paper.question_file_url;
    } else if (fileType === "solution") {
      fileUrl = paper.solution_file_url;
    }

    if (!fileUrl) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Track the download
    const userAgent = request.headers.get("user-agent");
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip");

    try {
      await supabase.from("paper_downloads").insert({
        paper_id: id,
        user_id: user.id,
        file_type: fileType,
        ip_address: ip,
        user_agent: userAgent,
      });
    } catch (downloadError) {
      console.error("Error tracking download:", downloadError);
      // Don't fail the request if tracking fails
    }

    return NextResponse.json({
      success: true,
      downloadUrl: fileUrl,
      message: "Download tracked successfully",
    });
  } catch (error) {
    console.error("Download paper API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
