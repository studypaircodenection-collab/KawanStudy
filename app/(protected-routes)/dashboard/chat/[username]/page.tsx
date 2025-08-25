import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersistentChat } from "@/components/chat/persistent-chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface ChatPageProps {
  params: {
    username: string;
  };
}

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

async function getUserProfile(username: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_profile_by_username", {
    username_param: username,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}

function ChatSkeleton() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-10 w-10 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-32"></div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-6 bg-muted rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function ChatContent({ params }: ChatPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser.username) {
    redirect("/auth/login");
  }

  const targetProfile = await getUserProfile(params.username);

  if (!targetProfile) {
    notFound();
  }

  // Don't allow chatting with yourself
  if (currentUser.username === params.username) {
    redirect(`/dashboard/profile/${params.username}`);
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card className="h-[600px] flex flex-col pb-0">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard/chat">
                    <Button variant="ghost" size="sm" className="p-2">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back to Chat List</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Avatar className="h-10 w-10">
              <AvatarImage
                src={targetProfile.avatar_url || ""}
                alt={targetProfile.full_name || ""}
              />
              <AvatarFallback>
                {targetProfile.full_name?.charAt(0) ||
                  targetProfile.username?.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {targetProfile.full_name || targetProfile.username}
              </CardTitle>
              <CardDescription>
                @{targetProfile.username}
                {targetProfile.university && ` • ${targetProfile.university}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <PersistentChat
            targetUsername={params.username}
            currentUsername={currentUser.username}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatContent params={params} />
    </Suspense>
  );
}
