import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Clock } from "lucide-react";
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
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <div className="h-8 bg-muted rounded w-48 animate-pulse mb-2"></div>
        <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
      </div>

      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-5 w-5 bg-muted rounded-full ml-auto"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: ConversationSummary;
  currentUsername: string;
}

function ConversationItem({
  conversation,
  currentUsername,
}: ConversationItemProps) {
  const { other_user, last_message, updated_at, unread_count } = conversation;

  return (
    <Link href={`/dashboard/chat/${other_user.username}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={other_user.avatar_url || ""}
                  alt={other_user.full_name || other_user.username}
                />
                <AvatarFallback>
                  {other_user.full_name?.charAt(0) ||
                    other_user.username?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              {unread_count > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unread_count > 9 ? "9+" : unread_count}
                </Badge>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">
                  {other_user.full_name || other_user.username}
                </h3>
                <span className="text-sm text-muted-foreground">
                  @{other_user.username}
                </span>
              </div>

              {last_message ? (
                <p className="text-sm text-muted-foreground truncate">
                  {last_message.sender_id === currentUsername ? "You: " : ""}
                  {last_message.content}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No messages yet
                </p>
              )}
            </div>

            <div className="text-right space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(updated_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

async function ConversationsContent() {
  const currentUser = await getCurrentUser();

  if (!currentUser.username) {
    redirect("/auth/login");
  }

  const conversations = await getUserConversations();

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Your conversations with other StudyPair members
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No conversations yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start a conversation by visiting someone's profile and clicking
              the message button
            </p>
            <Link
              href="/dashboard/leaderboard"
              className="text-primary hover:underline"
            >
              Browse users on the leaderboard →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Users className="h-4 w-4" />
            <span>
              {conversations.length} conversation
              {conversations.length !== 1 ? "s" : ""}
            </span>
          </div>

          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              currentUsername={currentUser.userId || ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={<ConversationsSkeleton />}>
      <ConversationsContent />
    </Suspense>
  );
}
