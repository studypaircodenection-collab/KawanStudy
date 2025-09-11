import { notesService } from "@/lib/services/notes";
import { NoteFormData } from "@/types/notes";
import { useState, useEffect, useCallback } from "react";

export interface NoteData {
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
  academicLevel?: string;
  language?: string;
  difficultyLevel?: string;
  institution?: string;
  status?: string;
  visibility?: string;
  userProfile?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

export interface NotesFilters {
  search?: string;
  subject?: string;
  academicLevel?: string;
  noteType?: string;
  language?: string;
  difficulty?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface NotesResponse {
  notes: NoteData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  stats?: {
    totalPublicNotes: number;
    totalViews: number;
    totalLikes: number;
    totalDownloads: number;
    mostPopularSubject: string;
    averageRating: number;
  };
  userProfile?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

interface UseNotesOptions {
  username?: string; // If provided, fetch notes for specific user
  myNotes?: boolean; // If true, fetch current user's notes (including private)
  initialFilters?: NotesFilters;
  autoLoad?: boolean;
}

export const useNoteUpload = () => {
  const uploadNote = async (
    formData: NoteFormData,
    file: File | null,
    contentType: "pdf" | "text"
  ) => {
    try {
      const result = await notesService.uploadNote(formData, file, contentType);
      return result;
    } catch (error) {
      console.error("Upload error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const likeNote = async (noteId: string) => {
    try {
      const result = await notesService.likeNote(noteId);
      return result;
    } catch (error) {
      console.error("Like error:", error);
      throw error;
    }
  };

  const downloadNote = async (noteId: string) => {
    try {
      await notesService.downloadNote(noteId);
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  };

  const updateNote = async (noteId: string, data: Partial<NoteFormData>) => {
    try {
      const result = await notesService.updateNote(noteId, data);
      return result;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const result = await notesService.deleteNote(noteId);
      return result;
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  };

  return {
    uploadNote,
    likeNote,
    downloadNote,
    updateNote,
    deleteNote,
  };
};

export function useNotes({
  username,
  myNotes = false,
  initialFilters = {},
  autoLoad = true,
}: UseNotesOptions = {}) {
  const [data, setData] = useState<NotesResponse | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotesFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotes = useCallback(
    async (page: number = 1, currentFilters: NotesFilters = filters) => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          ...currentFilters,
        });

        // Remove undefined/empty values
        for (const [key, value] of params.entries()) {
          if (!value || value === "undefined" || value === "all") {
            params.delete(key);
          }
        }

        // Determine API endpoint
        const endpoint = myNotes
          ? `/api/notes/my-notes?${params.toString()}`
          : username
          ? `/api/notes/user/${username}?${params.toString()}`
          : `/api/notes?${params.toString()}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User not found");
          }
          throw new Error("Failed to fetch notes");
        }

        const notesData = await response.json();
        console.log("Fetched notes data:", notesData);
        setData(notesData);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [myNotes, username, filters]
  );

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      fetchNotes(1, filters);
    }
  }, [autoLoad]);

  // Fetch when filters change
  useEffect(() => {
    if (autoLoad) {
      fetchNotes(1, filters);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<NotesFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const nextPage = useCallback(() => {
    if (data && data.hasMore) {
      fetchNotes(currentPage + 1);
    }
  }, [data, currentPage, fetchNotes]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchNotes(currentPage - 1);
    }
  }, [currentPage, fetchNotes]);

  const goToPage = useCallback(
    (page: number) => {
      if (page > 0 && data && page <= Math.ceil(data.total / data.limit)) {
        fetchNotes(page);
      }
    },
    [data, fetchNotes]
  );

  const refetch = useCallback(() => {
    fetchNotes(currentPage, filters);
  }, [fetchNotes, currentPage, filters]);

  return {
    data,
    loading,
    error,
    filters,
    currentPage,
    updateFilters,
    clearFilters,
    nextPage,
    prevPage,
    goToPage,
    refetch,
    fetchNotes,
  };
}
