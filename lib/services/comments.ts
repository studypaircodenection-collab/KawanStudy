import { createClient } from "@/lib/supabase/client";

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  user_id: string;
  status: "active" | "deleted";
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface CreateCommentResponse {
  success: boolean;
  comment?: Comment;
  error?: string;
}

export class CommentsService {
  private supabase = createClient();

  async getComments(noteId: string): Promise<CommentsResponse> {
    try {
      const response = await fetch(`/api/notes/${noteId}/comments`);

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      return await response.json();
    } catch (error) {
      console.error("Get comments error:", error);
      return {
        comments: [],
        total: 0,
      };
    }
  }

  async createComment(
    noteId: string,
    data: CreateCommentRequest
  ): Promise<CreateCommentResponse> {
    try {
      const response = await fetch(`/api/notes/${noteId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to create comment",
        };
      }

      return result;
    } catch (error) {
      console.error("Create comment error:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  async updateComment(
    noteId: string,
    commentId: string,
    content: string
  ): Promise<CreateCommentResponse> {
    try {
      const response = await fetch(
        `/api/notes/${noteId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to update comment",
        };
      }

      return result;
    } catch (error) {
      console.error("Update comment error:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  async deleteComment(
    noteId: string,
    commentId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `/api/notes/${noteId}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to delete comment",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Delete comment error:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }
}

export const commentsService = new CommentsService();
