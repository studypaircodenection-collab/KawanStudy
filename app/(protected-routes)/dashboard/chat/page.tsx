import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Users,
  Clock,
  Search,
  Plus,
  MessageSquare,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ConversationSummary } from "@/lib/types";

async function getCurrentUser(): Promise<{
  username: string | null;
  userId: string | null;
}> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { username: null, userId: null };
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (profileError || !profiles) {
      return { username: null, userId: user.id };
    }

    return { username: profiles.username, userId: user.id };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { username: null, userId: null };
  }
}

async function getUserConversations(): Promise<ConversationSummary[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("get_user_conversations");

    if (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

function ConversationsSkeleton() {
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-muted rounded w-48 animate-pulse mb-2"></div>
        <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
      </div>

      {/* Search and  Skeleton */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 h-10 bg-muted rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
              <div className="h-6 bg-muted rounded w-12 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversations List Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-5 w-5 bg-muted rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface ConversationCardProps {
  conversation: ConversationSummary;
  currentUserId: string;
}

function ConversationCard({
  conversation,
  currentUserId,
}: ConversationCardProps) {
  const { other_user, last_message, updated_at, unread_count } = conversation;

  const isUnread = unread_count > 0;

  return (
    <Link href={`/dashboard/chat/${other_user.username}`}>
      <Card
        className={`hover:shadow-md transition-all cursor-pointer ${
          isUnread ? "ring-2 ring-primary/20 bg-primary/5" : "hover:bg-muted/50"
        }`}
      >
        <CardContent className="p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={other_user.avatar_url || ""}
                  alt={other_user.full_name || other_user.username}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {other_user.full_name?.charAt(0) ||
                    other_user.username?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              {isUnread && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold truncate ${
                  isUnread ? "text-primary" : ""
                }`}
              >
                {other_user.full_name || other_user.username}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                @{other_user.username}
              </p>
            </div>

            {unread_count > 0 && (
              <Badge
                variant="default"
                className="h-6 min-w-6 flex items-center justify-center"
              >
                {unread_count > 99 ? "99+" : unread_count}
              </Badge>
            )}
          </div>

          {/* Last Message */}
          <div className="mb-3">
            {last_message ? (
              <p
                className={`text-sm truncate ${
                  isUnread ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {last_message.sender_id === currentUserId ? "You: " : ""}
                {last_message.content}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No messages yet
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {updated_at
                  ? formatDistanceToNow(new Date(updated_at), {
                      addSuffix: true,
                    })
                  : "Just now"}
              </span>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface ConversationStatsProps {
  conversations: ConversationSummary[];
}

function ConversationStats({ conversations }: ConversationStatsProps) {
  const totalConversations = conversations.length;
  const unreadCount = conversations.reduce(
    (sum, conv) => sum + conv.unread_count,
    0
  );
  const activeConversations = conversations.filter(
    (conv) => conv.last_message
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            Total Chats
          </div>
          <div className="text-2xl font-bold mt-1">{totalConversations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Star className="h-4 w-4" />
            Active Chats
          </div>
          <div className="text-2xl font-bold mt-1">{activeConversations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            Unread Messages
          </div>
          <div className="text-2xl font-bold mt-1 text-primary">
            {unreadCount}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function ChatContent() {
  const currentUser = await getCurrentUser();

  if (!currentUser.username) {
    redirect("/auth/login");
  }

  const conversations = await getUserConversations();

  // Sort conversations: unread first, then by most recent
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.unread_count > 0 && b.unread_count === 0) return -1;
    if (a.unread_count === 0 && b.unread_count > 0) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Chat Center</h1>
        <p className="text-muted-foreground">
          Manage all your conversations with KawanStudy members
        </p>
      </div>

      {/* Search and New Chat */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." className="pl-10" />
        </div>
        <Link href="/dashboard/peer">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <ConversationStats conversations={conversations} />

      {/* Conversations */}
      {sortedConversations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start your first conversation by visiting someone's profile and
              clicking the message button, or browse users on the leaderboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard/peer">
                <Button className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Browse Users
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  View My Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Unread Conversations */}
          {sortedConversations.some((conv) => conv.unread_count > 0) && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Unread Messages
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedConversations
                  .filter((conv) => conv.unread_count > 0)
                  .map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      currentUserId={currentUser.userId || ""}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* All Conversations */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              All Conversations
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  currentUserId={currentUser.userId || ""}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ConversationsSkeleton />}>
      <ChatContent />
    </Suspense>
  );
}
