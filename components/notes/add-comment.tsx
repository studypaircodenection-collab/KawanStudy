import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AddCommentProps {
  onSubmit: (content: string) => Promise<{ success: boolean; error?: string }>;
  placeholder?: string;
  buttonText?: string;
}

const AddComment: React.FC<AddCommentProps> = ({
  onSubmit,
  placeholder = "Write a comment...",
  buttonText = "Post Comment",
}) => {
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    const result = await onSubmit(content.trim());

    if (result.success) {
      setContent("");
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Please log in to leave a comment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="border size-10 flex-shrink-0">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>
            {user.user_metadata?.full_name?.charAt(0) ||
              user.user_metadata?.username?.charAt(0) ||
              user.email?.charAt(0)?.toUpperCase() ||
              "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[80px] resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {content.length}/1000 {content.length > 950 && "characters"}
              {content && " • Press Ctrl+Enter to post"}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? "Posting..." : buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddComment;
