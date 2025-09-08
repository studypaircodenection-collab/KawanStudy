import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: noteId } = await params;
    const { action } = await request.json();

    // Check authentication for certain actions
    const {
      data: { user },
    } = await supabase.auth.getUser();

    switch (action) {
      case "like":
        if (!user) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        // Check if note exists and is public
        const { data: note, error: noteError } = await supabase
          .from("notes")
          .select("id, visibility, status")
          .eq("id", noteId)
          .single();

        if (noteError || !note || note.status !== "published") {
          return NextResponse.json(
            { error: "Note not found" },
            { status: 404 }
          );
        }

        // Toggle like
        const { data: existingLike } = await supabase
          .from("note_likes")
          .select("id")
          .eq("note_id", noteId)
          .eq("user_id", user.id)
          .single();

        if (existingLike) {
          // Remove like
          const { error: removeLikeError } = await supabase
            .from("note_likes")
            .delete()
            .eq("note_id", noteId)
            .eq("user_id", user.id);

          if (removeLikeError) {
            return NextResponse.json(
              { error: "Failed to remove like" },
              { status: 500 }
            );
          }

          return NextResponse.json({ liked: false });
        } else {
          // Add like
          const { error: addLikeError } = await supabase
            .from("note_likes")
            .insert({
              note_id: noteId,
              user_id: user.id,
            });

          if (addLikeError) {
            return NextResponse.json(
              { error: "Failed to add like" },
              { status: 500 }
            );
          }

          return NextResponse.json({ liked: true });
        }

      case "download":
        // Check if note exists and allows downloads
        const { data: downloadNote, error: downloadNoteError } = await supabase
          .from("notes")
          .select("id, visibility, status, allow_download, file_url, file_path")
          .eq("id", noteId)
          .single();

        if (
          downloadNoteError ||
          !downloadNote ||
          downloadNote.status !== "published"
        ) {
          return NextResponse.json(
            { error: "Note not found" },
            { status: 404 }
          );
        }

        if (!downloadNote.allow_download) {
          return NextResponse.json(
            { error: "Downloads not allowed for this note" },
            { status: 403 }
          );
        }

        if (!downloadNote.file_url) {
          return NextResponse.json(
            { error: "No file available for download" },
            { status: 404 }
          );
        }

        // Log download
        const { error: logDownloadError } = await supabase
          .from("note_downloads")
          .insert({
            note_id: noteId,
            user_id: user?.id || null,
            ip_address:
              request.headers.get("x-forwarded-for") ||
              request.headers.get("x-real-ip") ||
              "unknown",
            user_agent: request.headers.get("user-agent"),
          });

        if (logDownloadError) {
          console.error("Error logging download:", logDownloadError);
          // Continue with download even if logging fails
        }

        return NextResponse.json({
          download_url: downloadNote.file_url,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Note action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
