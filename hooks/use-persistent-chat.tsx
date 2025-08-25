"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { Message, Conversation } from "@/lib/types";

interface UsePersistentChatProps {
  targetUsername: string;
  currentUsername: string;
}

export function usePersistentChat({
  targetUsername,
  currentUsername,
}: UsePersistentChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load conversation and messages
  const loadConversation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc(
        "get_conversation_by_username",
        {
          p_username: targetUsername,
        }
      );

      if (error) {
        console.error("Error loading conversation:", error);
        setError("Failed to load conversation");
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      setConversation(data);
      setMessages(data?.messages || []);
    } catch (err) {
      console.error("Error loading conversation:", err);
      setError("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }, [targetUsername, supabase]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return false;

      try {
        setSending(true);
        setError(null);

        const { data, error } = await supabase.rpc("send_message", {
          p_recipient_username: targetUsername,
          p_content: content.trim(),
          p_message_type: "text",
        });

        if (error) {
          console.error("Error sending message:", error);
          setError("Failed to send message");
          return false;
        }

        if (data?.error) {
          setError(data.error);
          return false;
        }

        // Add the new message to local state immediately
        setMessages((prev) => [...prev, data]);

        // Update conversation timestamp
        if (conversation) {
          setConversation((prev) =>
            prev
              ? {
                  ...prev,
                  updated_at: new Date().toISOString(),
                }
              : null
          );
        }

        // Broadcast the message for real-time delivery
        const roomName = [currentUsername, targetUsername].sort().join("_");
        const channel = supabase.channel(roomName);

        await channel.send({
          type: "broadcast",
          event: "new_message",
          payload: data,
        });

        return true;
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
        return false;
      } finally {
        setSending(false);
      }
    },
    [targetUsername, sending, conversation, supabase, currentUsername]
  );

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversation?.id) return;

    // Create room name for real-time updates (same logic as before for compatibility)
    const roomName = [currentUsername, targetUsername].sort().join("_");

    const channel = supabase
      .channel(roomName)
      // Listen for broadcast events (real-time messages)
      .on("broadcast", { event: "new_message" }, (payload) => {
        const newMessage = payload.payload as Message;

        // Only add if it's not from current user (to avoid duplicates)
        if (newMessage.sender.username !== currentUsername) {
          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });

          // Update conversation timestamp
          setConversation((prev) =>
            prev
              ? {
                  ...prev,
                  updated_at: newMessage.created_at,
                }
              : null
          );
        }
      })
      // Also listen for postgres changes as backup
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;

          // Get current user ID to compare
          const {
            data: { user },
          } = await supabase.auth.getUser();

          // Only add if it's not from current user and not already added via broadcast
          if (newMessage.sender_id !== user?.id) {
            // Small delay to let broadcast event go first
            setTimeout(() => {
              setMessages((prev) => {
                // Check if message already exists (likely added via broadcast)
                const exists = prev.some((msg) => msg.id === newMessage.id);
                if (!exists) {
                  // Reload conversation to get complete message with sender info
                  loadConversation();
                }
                return prev;
              });
            }, 100);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    conversation?.id,
    currentUsername,
    targetUsername,
    supabase,
    loadConversation,
  ]);

  // Load conversation on mount
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Mark messages as read when viewing
  const markMessagesAsRead = useCallback(async () => {
    if (!messages.length) return;

    try {
      // Mark all messages from the other user as read
      const otherUserMessages = messages.filter(
        (msg) => msg.sender.username !== currentUsername
      );

      for (const message of otherUserMessages) {
        await supabase.rpc("mark_message_read", {
          p_message_id: message.id,
        });
      }
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  }, [messages, currentUsername, supabase]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [markMessagesAsRead]);

  return {
    messages,
    conversation,
    loading,
    sending,
    error,
    isConnected,
    sendMessage,
    loadConversation,
  };
}
