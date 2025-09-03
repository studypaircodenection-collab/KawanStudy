"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/typography";
import { LoadingState, Skeleton } from "@/components/ui/loading";
import { VideoCallLauncher } from "@/components/video/video-call-launcher";
import {
  Video,
  Users,
  Clock,
  Calendar,
  Settings,
  Copy,
  Share2,
  UserPlus,
  Play,
  Lock,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface RoomData {
  id: string;
  room_id: string;
  host_user_id: string;
  room_type: string;
  status: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  metadata: {
    title?: string;
    description?: string;
    subject?: string;
    max_participants?: number;
    is_public?: boolean;
    scheduled_start?: string;
  };
  host_profile: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  participants: Array<{
    user_id: string;
    joined_at: string;
    is_host: boolean;
    connection_status: string;
    profile: {
      username: string;
      full_name?: string;
      avatar_url?: string;
    };
  }>;
}

const RoomDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchRoomData();
    getCurrentUser();
  }, [roomId]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fetchRoomData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("video_rooms")
        .select(
          `
          *,
          host_profile:profiles!host_user_id(username, full_name, avatar_url),
          participants:video_room_participants(
            user_id,
            joined_at,
            is_host,
            connection_status,
            profile:profiles(username, full_name, avatar_url)
          )
        `
        )
        .eq("room_id", roomId)
        .single();

      if (error) {
        toast.error("Failed to load room details");
        router.push("/dashboard/room");
        return;
      }

      setRoom(data);
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!currentUser || !room) return;

    setIsJoining(true);
    try {
      // Check if user is already a participant
      const existingParticipant = room.participants.find(
        (p) => p.user_id === currentUser.id
      );

      if (!existingParticipant) {
        const { error } = await supabase
          .from("video_room_participants")
          .insert({
            room_id: roomId,
            user_id: currentUser.id,
            is_host: false,
          });

        if (error) throw error;
      }

      // Navigate to active room
      router.push(`/dashboard/room/${roomId}/active-room`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/dashboard/room/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Room link copied to clipboard");
  };

  const shareRoom = async () => {
    const link = `${window.location.origin}/dashboard/room/${roomId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: room?.metadata.title || "Study Room",
          text: "Join me in this study room!",
          url: link,
        });
      } catch (error) {
        copyRoomLink();
      }
    } else {
      copyRoomLink();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-8">
            <Text as="h3">Room not found</Text>
            <Text as="p" styleVariant="muted" className="mt-2">
              The room you're looking for doesn't exist or has been deleted.
            </Text>
            <Button
              onClick={() => router.push("/dashboard/room")}
              className="mt-4"
            >
              Browse Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHost = currentUser?.id === room.host_user_id;
  const isParticipant = room.participants.some(
    (p) => p.user_id === currentUser?.id
  );
  const activeParticipants = room.participants.filter(
    (p) => p.connection_status === "connected"
  );
  const canJoin = room.status === "waiting" || room.status === "active";

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Text as="h1" className="mb-2">
            {room.metadata.title || "Study Room"}
          </Text>
          <div className="flex items-center gap-2">
            <Badge variant={room.status === "active" ? "default" : "secondary"}>
              {room.status}
            </Badge>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {room.participants.length}/{room.metadata.max_participants || "∞"}
            </Badge>
            {room.metadata.is_public ? (
              <Badge variant="outline">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={shareRoom}>
            <Share2 className="w-4 h-4" />
          </Button>
          {isHost && (
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/room/${roomId}/edit`)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Room
            </Button>
          )}
          {canJoin && (
            <Button
              onClick={joinRoom}
              disabled={isJoining}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              {isJoining
                ? "Joining..."
                : isParticipant
                ? "Rejoin Room"
                : "Join Room"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Info */}
          <Card>
            <CardHeader>
              <CardTitle>Room Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {room.metadata.description && (
                <div>
                  <Text as="p" className="font-medium mb-1">
                    Description
                  </Text>
                  <Text as="p" styleVariant="muted">
                    {room.metadata.description}
                  </Text>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {room.metadata.subject && (
                  <div>
                    <Text as="p" className="font-medium mb-1">
                      Subject
                    </Text>
                    <Badge variant="secondary">{room.metadata.subject}</Badge>
                  </div>
                )}

                <div>
                  <Text as="p" className="font-medium mb-1">
                    Room Type
                  </Text>
                  <Badge variant="outline">
                    {room.room_type.replace("_", " ")}
                  </Badge>
                </div>

                <div>
                  <Text as="p" className="font-medium mb-1">
                    Created
                  </Text>
                  <Text as="p" styleVariant="muted">
                    {format(
                      new Date(room.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </Text>
                </div>

                {room.metadata.scheduled_start && (
                  <div>
                    <Text as="p" className="font-medium mb-1">
                      Scheduled Start
                    </Text>
                    <Text as="p" styleVariant="muted">
                      {format(
                        new Date(room.metadata.scheduled_start),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </Text>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <Text as="p" className="font-medium mb-1">
                  Room ID
                </Text>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {roomId}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copyRoomLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Host Info */}
          <Card>
            <CardHeader>
              <CardTitle>Host</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={room.host_profile.avatar_url} />
                  <AvatarFallback>
                    {room.host_profile.full_name?.[0] ||
                      room.host_profile.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Text as="p" className="font-medium">
                    {room.host_profile.full_name || room.host_profile.username}
                  </Text>
                  <Text as="p" styleVariant="muted">
                    @{room.host_profile.username}
                  </Text>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants ({room.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {room.participants.length === 0 ? (
                <Text as="p" styleVariant="muted" className="text-center py-4">
                  No participants yet
                </Text>
              ) : (
                room.participants.map((participant) => (
                  <div
                    key={participant.user_id}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.profile.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {participant.profile.full_name?.[0] ||
                          participant.profile.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Text as="p" className="text-sm font-medium truncate">
                        {participant.profile.full_name ||
                          participant.profile.username}
                        {participant.is_host && " (Host)"}
                      </Text>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            participant.connection_status === "connected"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <Text
                          as="span"
                          styleVariant="muted"
                          className="text-xs"
                        >
                          {participant.connection_status}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {canJoin && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={joinRoom}
                  disabled={isJoining}
                  className="w-full"
                  size="lg"
                >
                  <Video className="w-4 h-4 mr-2" />
                  {isJoining ? "Joining..." : "Join Video Call"}
                </Button>

                <Button
                  variant="outline"
                  onClick={shareRoom}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Others
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
