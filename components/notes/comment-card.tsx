import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { MessageCircle, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Comment } from "@/lib/services/comments";
import { Text } from "../ui/typography";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { CustomizedAvatar } from "@/components/ui/customized-avatar";
interface CommentCardProps {
  comment: Comment;
  onReply?: (
    parentId: string,
    content: string
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdate?: (
    commentId: string,
    content: string
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete?: (
    commentId: string
  ) => Promise<{ success: boolean; error?: string }>;
  depth?: number;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onReply,
  onUpdate,
  onDelete,
  depth = 0,
}) => {
  const [user, setUser] = useState<any>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return diffInMinutes < 1 ? "just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !onReply) return;

    setIsSubmitting(true);
    const result = await onReply(comment.id, replyContent.trim());

    if (result.success) {
      setReplyContent("");
      setIsReplying(false);
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!editContent.trim() || !onUpdate) return;

    setIsSubmitting(true);
    const result = await onUpdate(comment.id, editContent.trim());

    if (result.success) {
      setIsEditing(false);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (
      !onDelete ||
      !window.confirm("Are you sure you want to delete this comment?")
    )
      return;

    await onDelete(comment.id);
  };

  const isOwner = user?.id === comment.user_id;
  const maxDepth = 3; // Limit nesting depth

  return (
    <div
      className={`w-full my-2 ${
        depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : ""
      }`}
    >
      <div className="flex items-start gap-2 w-full">
        {comment.status === "deleted" ? (
          <Avatar className="border size-10 flex-shrink-0">
            <AvatarFallback className="bg-gray-200">?</AvatarFallback>
          </Avatar>
        ) : (
          <CustomizedAvatar
            src={comment.profiles.avatar_url}
            userId={comment.profiles.id}
            size="md"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {comment.status === "deleted" ? (
                <>
                  <Text as="p" styleVariant="muted">
                    [Anonymous]
                  </Text>
                  <Text as="p" styleVariant="muted">
                    {formatDate(comment.created_at)}
                  </Text>
                </>
              ) : (
                <>
                  <Link
                    href={`/dashboard/profile/${comment.profiles.username}`}
                    className="text-sm font-medium truncate hover:underline"
                  >
                    {comment.profiles.full_name || comment.profiles.username}
                  </Link>
                  <Text as="p" styleVariant="muted" className="text-xs">
                    @{comment.profiles.username}
                  </Text>
                  <Text as="p" styleVariant="muted" className="text-xs">
                    {formatDate(comment.created_at)}
                  </Text>
                </>
              )}
            </div>

            {/* Only show edit/delete menu for active comments */}
            {isOwner && comment.status === "active" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing && comment.status === "active" ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={!editContent.trim() || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {comment.status === "deleted" ? (
                <Text
                  as="p"
                  styleVariant="muted"
                  className="text-sm mt-1 italic"
                >
                  [This comment has been deleted]
                </Text>
              ) : (
                <p className="text-sm mt-1 break-words">{comment.content}</p>
              )}

              {user && depth < maxDepth && comment.status === "active" && (
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(!isReplying)}
                    className="h-6 text-xs px-2"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                </div>
              )}
            </>
          )}

          {isReplying && (
            <div className="mt-2 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${comment.profiles.username}...`}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
