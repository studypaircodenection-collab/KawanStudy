"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VideoRoom } from "@/components/video/video-room";
import { WebRTCVideoRoom } from "@/components/video/webrtc-video-room";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { LoadingState } from "@/components/ui/loading";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface RoomData {
  room_id: string;
  room_type: string;
  status: string;
  host_user_id: string;
  metadata: {
    title?: string;
    max_participants?: number;
  };
}

const ActiveRoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    validateAndLoadRoom();
  }, [roomId]);

  const validateAndLoadRoom = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setCurrentUser(profile);

      // Check if room exists and user has access
      const { data: roomData, error: roomError } = await supabase
        .from("video_rooms")
        .select("*")
        .eq("room_id", roomId)
        .single();

      if (roomError || !roomData) {
        setError("Room not found or access denied");
        return;
      }

      // Check if room is active or waiting
      if (roomData.status === "ended") {
        setError("This room has ended");
        return;
      }

      // Check if user is a participant or can join
      const { data: participant } = await supabase
        .from("video_room_participants")
        .select("*")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .single();

      // If user is not a participant and room is not public, check permissions
      if (!participant && roomData.host_user_id !== user.id) {
        // Auto-join if room allows it
        const { error: joinError } = await supabase
          .from("video_room_participants")
          .insert({
            room_id: roomId,
            user_id: user.id,
            is_host: false,
          });

        if (joinError) {
          setError("Failed to join room");
          return;
        }
      }

      // Update room status to active if it's still waiting
      if (roomData.status === "waiting") {
        await supabase
          .from("video_rooms")
          .update({
            status: "active",
            started_at: new Date().toISOString(),
          })
          .eq("room_id", roomId);
      }

      setRoom(roomData);
    } catch (err) {
      console.error("Error loading room:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      // Update participant status
      if (currentUser) {
        await supabase
          .from("video_room_participants")
          .update({
            left_at: new Date().toISOString(),
            connection_status: "disconnected",
          })
          .eq("room_id", roomId)
          .eq("user_id", currentUser.id);
      }

      // Navigate back to room details
      router.push(`/dashboard/room/${roomId}`);
    } catch (error) {
      console.error("Error leaving room:", error);
      router.push(`/dashboard/room/${roomId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingState message="Connecting to room..." />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <Text as="h3" className="mb-2">
              Unable to Join Room
            </Text>
            <Text as="p" styleVariant="muted" className="mb-4">
              {error || "Something went wrong"}
            </Text>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/room")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Rooms
              </Button>
              <Button onClick={() => router.push(`/dashboard/room/${roomId}`)}>
                Room Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render appropriate video room component based on room type
  const renderVideoRoom = () => {
    switch (room.room_type) {
      case "peer_to_peer":
        return <VideoRoom roomId={roomId} onLeave={handleLeaveRoom} />;
      case "group":
      case "tutor_session":
        return <WebRTCVideoRoom roomId={roomId} onLeave={handleLeaveRoom} />;
      default:
        return <VideoRoom roomId={roomId} onLeave={handleLeaveRoom} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Room Header - can be hidden during call */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/room/${roomId}`)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <Text as="p" className="text-white font-medium">
                {room.metadata.title || "Study Room"}
              </Text>
              <Text as="p" className="text-white/70 text-sm">
                Room ID: {roomId}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Video Room Component */}
      <div className="relative">{renderVideoRoom()}</div>
    </div>
  );
};

export default ActiveRoomPage;
