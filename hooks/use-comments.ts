import { useState, useEffect } from "react";
import {
  commentsService,
  Comment,
  CreateCommentRequest,
} from "@/lib/services/comments";

export function useComments(noteId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await commentsService.getComments(noteId);

      setComments(result.comments);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (data: CreateCommentRequest) => {
    try {
      const result = await commentsService.createComment(noteId, data);

      if (result.success && result.comment) {
        // Add comment to the list
        if (data.parentId) {
          // Find parent comment and add as reply
          setComments((prevComments) => {
            const updateComments = (comments: Comment[]): Comment[] => {
              return comments.map((comment) => {
                if (comment.id === data.parentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), result.comment!],
                  };
                }
                if (comment.replies) {
                  return {
                    ...comment,
                    replies: updateComments(comment.replies),
                  };
                }
                return comment;
              });
            };
            return updateComments(prevComments);
          });
        } else {
          // Add as root comment
          setComments((prev) => [...prev, { ...result.comment!, replies: [] }]);
        }
        setTotal((prev) => prev + 1);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to add comment",
      };
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      const result = await commentsService.updateComment(
        noteId,
        commentId,
        content
      );

      if (result.success && result.comment) {
        // Update comment in the list
        setComments((prevComments) => {
          const updateComments = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
              if (comment.id === commentId) {
                return result.comment!;
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: updateComments(comment.replies),
                };
              }
              return comment;
            });
          };
          return updateComments(prevComments);
        });
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update comment",
      };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const result = await commentsService.deleteComment(noteId, commentId);

      if (result.success) {
        // Refresh comments to get the updated state from server
        // This ensures we properly handle comments that were marked as deleted vs completely removed
        await loadComments();
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete comment",
      };
    }
  };

  useEffect(() => {
    if (noteId) {
      loadComments();
    }
  }, [noteId]);

  return {
    comments,
    loading,
    error,
    total,
    addComment,
    updateComment,
    deleteComment,
    refetch: loadComments,
  };
}
