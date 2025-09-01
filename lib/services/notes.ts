import { createClient } from "@/lib/supabase/client";
import { NoteFormData } from "@/types/notes";

export interface NoteUploadResponse {
  success: boolean;
  note?: {
    id: string;
    title: string;
    description: string;
    subject: string;
    file_url?: string;
    created_at: string;
  };
  error?: string;
}

export interface NotesListResponse {
  notes: Array<{
    id: string;
    title: string;
    description: string;
    subject: string;
    noteType: string;
    tags: string[];
    createdAt: string;
    estimatedReadTime: number;
    viewCount?: number;
    downloadCount?: number;
    likeCount?: number;
    thumbnailUrl?: string;
    userProfile?: {
      id: string;
      username: string;
      fullName: string;
      avatarUrl: string;
    };
  }>;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NoteSearchFilters {
  subject?: string;
  academicLevel?: string;
  noteType?: string;
  language?: string;
  difficulty?: string;
}

export class NotesService {
  private supabase = createClient();

  async uploadNote(
    formData: NoteFormData,
    file: File | null,
    contentType: "pdf" | "text",
    thumbnailFile?: File | null
  ): Promise<NoteUploadResponse> {
    try {
      const uploadData = new FormData();

      // Add all form fields
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("subject", formData.subject);
      uploadData.append("topic", formData.topic);
      uploadData.append("academicLevel", formData.academicLevel);
      uploadData.append("institution", formData.institution);
      uploadData.append("course", formData.course);
      uploadData.append("professor", formData.professor);
      uploadData.append("semester", formData.semester);
      uploadData.append("noteType", formData.noteType);
      uploadData.append("tags", JSON.stringify(formData.tags));
      uploadData.append("language", formData.language);
      uploadData.append("difficulty", formData.difficulty);
      uploadData.append("sourceType", formData.sourceType);
      uploadData.append("sourceReference", formData.sourceReference);
      uploadData.append("sharingOption", formData.sharingOption);
      uploadData.append("allowDownload", formData.allowDownload.toString());
      uploadData.append("allowComments", formData.allowComments.toString());
      uploadData.append(
        "estimatedReadTime",
        formData.estimatedReadTime.toString()
      );
      uploadData.append("contentType", contentType);
      uploadData.append("textContent", formData.textContent);

      if (file) {
        uploadData.append("file", file);
      }

      if (thumbnailFile) {
        uploadData.append("thumbnail", thumbnailFile);
      }

      const response = await fetch("/api/notes", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Upload failed",
        };
      }

      return result;
    } catch (error) {
      console.error("Upload service error:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  async searchNotes(
    searchTerm: string = "",
    filters: NoteSearchFilters = {},
    sortBy: string = "created_at",
    sortDirection: "asc" | "desc" = "desc",
    page: number = 1,
    limit: number = 20
  ): Promise<NotesListResponse> {
    try {
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.academicLevel)
        params.append("academicLevel", filters.academicLevel);
      if (filters.noteType) params.append("noteType", filters.noteType);
      if (filters.language) params.append("language", filters.language);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);

      params.append("sortBy", sortBy);
      params.append("sortDirection", sortDirection);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await fetch(`/api/notes?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const result = await response.json();

      // Transform the response to match the expected format
      const transformedNotes = result.notes.map((note: any) => ({
        id: note.id,
        title: note.title,
        description: note.description,
        subject: note.subject,
        noteType: note.note_type,
        tags: note.tags || [],
        createdAt: note.created_at,
        estimatedReadTime: note.estimated_read_time || 0,
        viewCount: note.view_count || 0,
        downloadCount: note.download_count || 0,
        likeCount: note.like_count || 0,
        thumbnailUrl: note.thumbnail_url,
        userProfile: note.user_profile
          ? {
              id: note.user_profile.id,
              username: note.user_profile.username,
              fullName: note.user_profile.full_name,
              avatarUrl: note.user_profile.avatar_url,
            }
          : undefined,
      }));

      return {
        notes: transformedNotes,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error("Search service error:", error);
      return {
        notes: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      };
    }
  }

  async getNoteById(id: string) {
    try {
      const response = await fetch(`/api/notes/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch note");
      }

      return await response.json();
    } catch (error) {
      console.error("Get note service error:", error);
      throw error;
    }
  }

  async likeNote(id: string) {
    try {
      const response = await fetch(`/api/notes/${id}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "like" }),
      });

      if (!response.ok) {
        throw new Error("Failed to like note");
      }

      return await response.json();
    } catch (error) {
      console.error("Like note service error:", error);
      throw error;
    }
  }

  async downloadNote(id: string) {
    try {
      const response = await fetch(`/api/notes/${id}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "download" }),
      });

      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }

      const result = await response.json();

      // Open download URL in new tab
      if (result.download_url) {
        window.open(result.download_url, "_blank");
      }

      return result;
    } catch (error) {
      console.error("Download note service error:", error);
      throw error;
    }
  }

  async deleteNote(id: string) {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      return await response.json();
    } catch (error) {
      console.error("Delete note service error:", error);
      throw error;
    }
  }

  async updateNote(id: string, data: Partial<NoteFormData>) {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      return await response.json();
    } catch (error) {
      console.error("Update note service error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const notesService = new NotesService();
