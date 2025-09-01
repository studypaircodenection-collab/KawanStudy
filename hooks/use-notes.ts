import { notesService } from "@/lib/services/notes";
import { NoteFormData } from "@/types/notes";

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
