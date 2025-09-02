import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const subject = formData.get("subject") as string;
    const topic = formData.get("topic") as string;
    const academicLevel = formData.get("academicLevel") as string;
    const institution = formData.get("institution") as string;
    const course = formData.get("course") as string;
    const professor = formData.get("professor") as string;
    const semester = formData.get("semester") as string;
    const noteType = formData.get("noteType") as string;
    const tags = JSON.parse((formData.get("tags") as string) || "[]");
    const language = formData.get("language") as string;
    const difficulty = formData.get("difficulty") as string;
    const sourceType = formData.get("sourceType") as string;
    const sourceReference = formData.get("sourceReference") as string;
    const sharingOption = formData.get("sharingOption") as string;
    const allowDownload = formData.get("allowDownload") === "true";
    const allowComments = formData.get("allowComments") === "true";
    const estimatedReadTime = parseInt(
      (formData.get("estimatedReadTime") as string) || "0"
    );
    const contentType = formData.get("contentType") as "pdf" | "text";
    const textContent = formData.get("textContent") as string;
    const file = formData.get("file") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    // Validation
    if (!title || !subject || !academicLevel || !contentType || !noteType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (contentType === "pdf" && !file) {
      return NextResponse.json(
        { error: "File is required for PDF uploads" },
        { status: 400 }
      );
    }

    if (contentType === "text" && !textContent) {
      return NextResponse.json(
        { error: "Text content is required for text notes" },
        { status: 400 }
      );
    }

    let fileUrl = null;
    let filePath = null;
    let fileName = null;
    let fileSize = null;

    // Handle file upload for PDF
    if (contentType === "pdf" && file) {
      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        return NextResponse.json(
          { error: "File size must be less than 10MB" },
          { status: 400 }
        );
      }

      if (!file.type.includes("pdf")) {
        return NextResponse.json(
          { error: "Only PDF files are allowed" },
          { status: 400 }
        );
      }

      // Create unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      filePath = `${user.id}/${timestamp}_${sanitizedFileName}`;
      fileName = file.name;
      fileSize = file.size;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("notes")
        .getPublicUrl(filePath);

      fileUrl = urlData.publicUrl;
    }

    // Handle thumbnail upload
    let thumbnailUrl = null;
    let thumbnailPath = null;
    let thumbnailFileName = null;
    let thumbnailFileSize = null;

    if (thumbnailFile) {
      // Generate unique thumbnail path
      const thumbnailExt = thumbnailFile.name.split(".").pop();
      const thumbnailFilePath = `${
        user.id
      }/thumbnails/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${thumbnailExt}`;

      thumbnailFileName = thumbnailFile.name;
      thumbnailFileSize = thumbnailFile.size;
      thumbnailPath = thumbnailFilePath;

      // Upload thumbnail to Supabase Storage
      const { error: thumbnailUploadError } = await supabase.storage
        .from("note-thumbnails")
        .upload(thumbnailFilePath, thumbnailFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (thumbnailUploadError) {
        console.error("Thumbnail upload error:", thumbnailUploadError);
        // Don't fail the entire upload for thumbnail issues, just log it
      } else {
        // Get public URL for thumbnail
        const { data: thumbnailUrlData } = supabase.storage
          .from("note-thumbnails")
          .getPublicUrl(thumbnailFilePath);

        thumbnailUrl = thumbnailUrlData.publicUrl;
      }
    }

    // Map form values to database values
    const visibility =
      sharingOption === "Public"
        ? "public"
        : sharingOption === "Friends Only"
        ? "friends-only"
        : "private";

    const mappedNoteType = noteType.toLowerCase().replace(/\s+/g, "-") as any;
    const mappedLanguage = language.toLowerCase().replace(/\s+/g, "-") as any;
    const mappedDifficulty = difficulty.toLowerCase() as any;
    const mappedAcademicLevel = academicLevel
      .toLowerCase()
      .replace(/\s+/g, "-") as any;

    // Create note record
    const noteData = {
      user_id: user.id,
      title,
      description,
      content: contentType === "text" ? textContent : undefined,
      content_type: contentType,
      subject,
      topic,
      academic_level: mappedAcademicLevel,
      institution,
      course,
      professor,
      semester,
      note_type: mappedNoteType,
      tags,
      language: mappedLanguage || "english",
      difficulty_level: mappedDifficulty || "beginner",
      visibility,
      target_audience: "students",
      license: "all-rights-reserved",
      allow_download: allowDownload,
      allow_comments: allowComments,
      source_type: sourceType?.toLowerCase().replace(/\s+/g, "-") || "original",
      source_reference: sourceReference,
      estimated_read_time: estimatedReadTime,
      file_name: fileName,
      file_size: fileSize,
      file_url: fileUrl,
      file_path: filePath,
      thumbnail_url: thumbnailUrl,
      thumbnail_path: thumbnailPath,
      thumbnail_file_name: thumbnailFileName,
      thumbnail_file_size: thumbnailFileSize,
      status: "published", // Auto-publish for now, could be "pending" for moderation
    };

    const { data: note, error: insertError } = await supabase
      .from("notes")
      .insert(noteData)
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);

      // Clean up uploaded file if database insert fails
      if (filePath) {
        await supabase.storage.from("notes").remove([filePath]);
      }

      return NextResponse.json(
        { error: "Failed to save note" },
        { status: 500 }
      );
    }

    // Award points for note upload (gamification)
    try {
      await supabase.rpc("log_user_activity", {
        p_user_id: user.id,
        p_activity_type: "note_upload",
        p_points: 25, // Points for uploading a note
        p_description: `Uploaded note: ${title}`,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
      // Don't fail the request if gamification fails
    }

    return NextResponse.json({
      success: true,
      note: {
        id: note.id,
        title: note.title,
        description: note.description,
        subject: note.subject,
        file_url: note.file_url,
        created_at: note.created_at,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const search = searchParams.get("search") || "";
    const subject = searchParams.get("subject");
    const academicLevel = searchParams.get("academicLevel");
    const noteType = searchParams.get("noteType");
    const language = searchParams.get("language");
    const difficulty = searchParams.get("difficulty");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortDirection = searchParams.get("sortDirection") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Use the search function from the database
    const { data: notes, error } = await supabase.rpc("search_notes", {
      search_query: search,
      filter_subject: subject,
      filter_academic_level: academicLevel?.toLowerCase().replace(/\s+/g, "-"),
      filter_note_type: noteType?.toLowerCase().replace(/\s+/g, "-"),
      filter_language: language?.toLowerCase().replace(/\s+/g, "-"),
      filter_difficulty: difficulty?.toLowerCase(),
      filter_visibility: "public",
      sort_by: sortBy,
      sort_direction: sortDirection,
      page_limit: limit,
      page_offset: offset,
    });

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Failed to search notes" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .eq("visibility", "public");

    if (countError) {
      console.error("Count error:", countError);
    }

    return NextResponse.json({
      notes: notes || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit,
    });
  } catch (error) {
    console.error("Get notes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
