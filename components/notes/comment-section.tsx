import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { MessageCircle, Plus, Minus } from "lucide-react";
import { useComments } from "@/hooks/use-comments";
import CommentCard from "./comment-card";
import AddComment from "./add-comment";
import { Separator } from "@/components/ui/separator";

interface CommentSectionProps {
  noteId: string;
  allowComments: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  noteId,
  allowComments,
}) => {
  const [showAddComment, setShowAddComment] = useState(false);
  const {
    comments,
    loading,
    error,
    total,
    addComment,
    updateComment,
    deleteComment,
  } = useComments(noteId);

  const handleAddComment = async (content: string) => {
    const result = await addComment({ content });
    if (result.success) {
      setShowAddComment(false);
    }
    return result;
  };

  const handleReply = async (parentId: string, content: string) => {
    return await addComment({ content, parentId });
  };

  if (!allowComments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments Disabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Comments are not allowed on this note.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center flex-wrap">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({total})
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddComment(!showAddComment)}
        >
          {showAddComment ? (
            <>
              <Minus className="h-4 w-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Comment
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {showAddComment && (
          <>
            <AddComment
              onSubmit={handleAddComment}
              placeholder="Share your thoughts about this note..."
            />
            <Separator />
          </>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading comments...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Failed to load comments: {error}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="mb-2">No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onUpdate={updateComment}
                  onDelete={deleteComment}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentSection;
