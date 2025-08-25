"use client";

import { cn } from "@/lib/utils";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { usePersistentChat } from "@/hooks/use-persistent-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PersistentChatProps {
  targetUsername: string;
  currentUsername: string;
  className?: string;
}

interface ChatMessageProps {
  message: any;
  isOwnMessage: boolean;
  showHeader: boolean;
}

const ChatMessageItem = ({
  message,
  isOwnMessage,
  showHeader,
}: ChatMessageProps) => {
  return (
    <div
      className={`flex mt-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={cn("max-w-[75%] w-fit flex flex-col gap-1", {
          "items-end": isOwnMessage,
        })}
      >
        {showHeader && (
          <div
            className={cn("flex items-center gap-2 text-xs px-3", {
              "justify-end flex-row-reverse": isOwnMessage,
            })}
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={message.sender.avatar_url || ""}
                  alt={
                    message.sender.full_name || message.sender.username || ""
                  }
                />
                <AvatarFallback className="text-xs">
                  {message.sender.full_name?.charAt(0) ||
                    message.sender.username?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {message.sender.full_name || message.sender.username}
              </span>
            </div>
            <span className="text-foreground/50 text-xs">
              {formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}
        <div
          className={cn(
            "py-2 px-3 rounded-xl text-sm w-fit",
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {message.content}
          {message.is_edited && (
            <span className="text-xs opacity-70 ml-2">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const PersistentChat = ({
  targetUsername,
  currentUsername,
  className,
}: PersistentChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll();
  const [newMessage, setNewMessage] = useState("");

  const {
    messages,

    loading,
    sending,
    error,
    isConnected,
    sendMessage,
    loadConversation,
  } = usePersistentChat({
    targetUsername,
    currentUsername,
  });

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || sending) return;

      const success = await sendMessage(newMessage);
      if (success) {
        setNewMessage("");
      }
    },
    [newMessage, sending, sendMessage]
  );

  const handleRetry = useCallback(() => {
    loadConversation();
  }, [loadConversation]);

  if (loading) {
    return (
      <div
        className={cn("flex flex-col h-full w-full bg-background", className)}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn("flex flex-col h-full w-full bg-background", className)}
      >
        <div className="flex-1 flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full bg-background text-foreground antialiased",
        className
      )}
    >
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-sm">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span>Reconnecting to real-time updates...</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <div className="mb-2">💬</div>
            <div>No messages yet.</div>
            <div>Send a message to start the conversation!</div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showHeader =
                !prevMessage ||
                prevMessage.sender.username !== message.sender.username ||
                new Date(message.created_at).getTime() -
                  new Date(prevMessage.created_at).getTime() >
                  300000; // 5 minutes

              return (
                <div
                  key={message.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <ChatMessageItem
                    message={message}
                    isOwnMessage={message.sender.username === currentUsername}
                    showHeader={showHeader}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex w-full gap-2 border-t border-border p-4"
      >
        <Input
          className={cn(
            "rounded-full bg-background text-sm transition-all duration-300",
            newMessage.trim() ? "w-[calc(100%-52px)]" : "w-full"
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${targetUsername}...`}
          disabled={sending}
          maxLength={4000}
        />
        {newMessage.trim() && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={sending}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        )}
      </form>
    </div>
  );
};
