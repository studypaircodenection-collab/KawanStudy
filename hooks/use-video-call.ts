"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface VideoCallUser {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface ParticipantStream {
  userId: string;
  stream: MediaStream;
  user: VideoCallUser;
}

interface UseVideoCallProps {
  roomId?: string;
  autoJoin?: boolean;
}

export function useVideoCall({
  roomId: initialRoomId,
  autoJoin = false,
}: UseVideoCallProps = {}) {
  // State
  const [roomId, setRoomId] = useState<string>(initialRoomId || "");
  const [isInRoom, setIsInRoom] = useState(false);
  const [participants, setParticipants] = useState<VideoCallUser[]>([]);
  const [participantStreams, setParticipantStreams] = useState<{
    [userId: string]: MediaStream;
  }>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState("00:00");
  const [currentUser, setCurrentUser] = useState<VideoCallUser | null>(null);
  const [roomStatus, setRoomStatus] = useState<"waiting" | "active" | "ended">(
    "waiting"
  );

  // Refs for WebRTC
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<{ [userId: string]: RTCPeerConnection }>(
    {}
  );
  const supabase = createClient();
  const channelRef = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);

  // WebRTC configuration (same as WebDevSimplified)
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          });
        }
      }
    }
    getCurrentUser();
  }, [supabase]);

  // Format call duration
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Start call timer
  const startCallTimer = useCallback(() => {
    if (!callTimerRef.current) {
      callStartTimeRef.current = new Date();
      callTimerRef.current = setInterval(() => {
        if (callStartTimeRef.current) {
          const elapsed = Math.floor(
            (Date.now() - callStartTimeRef.current.getTime()) / 1000
          );
          setCallDuration(formatDuration(elapsed));
        }
      }, 1000);
    }
  }, [formatDuration]);

  // Stop call timer
  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
      callStartTimeRef.current = null;
      setCallDuration("00:00");
    }
  }, []);

  // Create peer connection for a specific user (WebDevSimplified approach)
  const createPeerConnection = useCallback(
    (userId: string): RTCPeerConnection => {
      const peerConnection = new RTCPeerConnection(iceServers);

      // Add local stream to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle remote stream - Store in participantStreams for dynamic display
      peerConnection.ontrack = (event) => {
        console.log("Received remote stream from:", userId);
        const [remoteStream] = event.streams;

        // Store stream for this specific user
        setParticipantStreams((prev) => ({
          ...prev,
          [userId]: remoteStream,
        }));

        console.log("✅ Stream stored for user:", userId);
      };

      // Handle ICE candidates (WebDevSimplified approach)
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          console.log("Sending ICE candidate to:", userId);
          channelRef.current.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: {
              candidate: event.candidate,
              targetUserId: userId,
              fromUserId: currentUser?.id,
            },
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(
          "Connection state for",
          userId,
          ":",
          peerConnection.connectionState
        );
        if (peerConnection.connectionState === "connected") {
          console.log("✅ Connected to user:", userId);
          setRoomStatus("active");
          if (!callTimerRef.current) {
            startCallTimer();
          }
        } else if (peerConnection.connectionState === "failed") {
          console.log("❌ Connection failed, attempting to restart ICE");
          peerConnection.restartIce();
        }
      };

      peerConnectionsRef.current[userId] = peerConnection;
      return peerConnection;
    },
    [currentUser, iceServers, startCallTimer]
  );

  // Connect to a new user (WebDevSimplified connectToNewUser function)
  const connectToNewUser = useCallback(
    async (userId: string) => {
      if (!currentUser || !localStreamRef.current) return;

      console.log("🤝 Connecting to new user:", userId);
      const peerConnection = createPeerConnection(userId);

      try {
        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send offer via Supabase Realtime (replacing Socket.io)
        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "offer",
            payload: {
              offer,
              targetUserId: userId,
              fromUserId: currentUser.id,
            },
          });
        }
      } catch (error) {
        console.error("❌ Error creating offer for user", userId, ":", error);
      }
    },
    [currentUser, createPeerConnection]
  );

  // Clean up participant stream
  const removeParticipantStream = useCallback((userId: string) => {
    setParticipantStreams((prev) => {
      const updated = { ...prev };
      if (updated[userId]) {
        // Stop all tracks in the stream
        updated[userId].getTracks().forEach((track) => track.stop());
        delete updated[userId];
        console.log("🧹 Cleaned up stream for user:", userId);
      }
      return updated;
    });
  }, []);

  // Get all current participant streams with user info
  const getParticipantStreamsWithInfo = useCallback((): ParticipantStream[] => {
    return Object.entries(participantStreams).map(([userId, stream]) => {
      const user = participants.find((p) => p.id === userId);
      return {
        userId,
        stream,
        user: user || {
          id: userId,
          username: "Unknown User",
          full_name: undefined,
          avatar_url: undefined,
        },
      };
    });
  }, [participantStreams, participants]);
  const handleSignalingMessage = useCallback(
    async (event: string, payload: any) => {
      if (!currentUser || payload.targetUserId !== currentUser.id) return;

      const { fromUserId } = payload;
      console.log(`📨 Received ${event} from:`, fromUserId);

      switch (event) {
        case "offer":
          try {
            let peerConnection = peerConnectionsRef.current[fromUserId];
            if (!peerConnection) {
              peerConnection = createPeerConnection(fromUserId);
            }

            await peerConnection.setRemoteDescription(payload.offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            // Send answer back
            if (channelRef.current) {
              channelRef.current.send({
                type: "broadcast",
                event: "answer",
                payload: {
                  answer,
                  targetUserId: fromUserId,
                  fromUserId: currentUser.id,
                },
              });
            }
          } catch (error) {
            console.error("❌ Error handling offer:", error);
          }
          break;

        case "answer":
          try {
            const peerConnection = peerConnectionsRef.current[fromUserId];
            if (peerConnection) {
              await peerConnection.setRemoteDescription(payload.answer);
            }
          } catch (error) {
            console.error("❌ Error handling answer:", error);
          }
          break;

        case "ice-candidate":
          try {
            const peerConnection = peerConnectionsRef.current[fromUserId];
            if (peerConnection && payload.candidate) {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate(payload.candidate)
              );
            }
          } catch (error) {
            console.error("❌ Error handling ICE candidate:", error);
          }
          break;
      }
    },
    [currentUser, createPeerConnection]
  );

  // Fetch current participants from database
  const fetchCurrentParticipants = useCallback(
    async (roomIdToFetch: string) => {
      if (!currentUser) return;

      try {
        const { data: participantsData, error } = await supabase
          .from("video_room_participants")
          .select(
            `
          user_id,
          connection_status,
          left_at,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `
          )
          .eq("room_id", roomIdToFetch)
          .is("left_at", null) // Only get active participants
          .eq("connection_status", "connected");

        if (error) {
          console.error("❌ Error fetching participants:", error);
          return;
        }

        if (participantsData) {
          const activeParticipants: VideoCallUser[] = participantsData
            .filter((p) => p.user_id !== currentUser.id && p.profiles) // Exclude current user
            .map((p) => {
              // Handle both single object and array cases for profiles
              const profile = Array.isArray(p.profiles)
                ? p.profiles[0]
                : p.profiles;
              return {
                id: profile?.id || p.user_id,
                username: profile?.username || "Unknown",
                full_name: profile?.full_name,
                avatar_url: profile?.avatar_url,
              } as VideoCallUser;
            })
            .filter((p) => p.id && p.username); // Filter out invalid participants

          console.log("👥 Current active participants:", activeParticipants);
          setParticipants(activeParticipants);

          // Connect to existing participants
          activeParticipants.forEach((participant) => {
            setTimeout(() => connectToNewUser(participant.id), 1000);
          });
        }
      } catch (error) {
        console.error("❌ Error fetching participants:", error);
      }
    },
    [currentUser, supabase, connectToNewUser]
  );

  // Set up real-time listeners for WebRTC signaling and participant changes
  const setupRealtimeListeners = useCallback(
    (roomIdToListen: string) => {
      if (!currentUser) return;

      console.log(
        "📡 Setting up real-time listeners for room:",
        roomIdToListen
      );

      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`video_room_${roomIdToListen}`)
        // Listen for WebRTC signaling messages
        .on("broadcast", { event: "offer" }, (payload) => {
          handleSignalingMessage("offer", payload.payload);
        })
        .on("broadcast", { event: "answer" }, (payload) => {
          handleSignalingMessage("answer", payload.payload);
        })
        .on("broadcast", { event: "ice-candidate" }, (payload) => {
          handleSignalingMessage("ice-candidate", payload.payload);
        })
        // Listen for participant join events (database INSERT)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "video_room_participants",
            filter: `room_id=eq.${roomIdToListen}`,
          },
          async (payload) => {
            console.log("� New participant joined database:", payload.new);

            if (payload.new.user_id !== currentUser.id) {
              // Get user profile
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", payload.new.user_id)
                .single();

              if (profile) {
                const newParticipant: VideoCallUser = {
                  id: profile.id,
                  username: profile.username,
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                };

                console.log("👋 Adding new participant:", newParticipant);
                setParticipants((prev) => {
                  // Avoid duplicates
                  const filtered = prev.filter(
                    (p) => p.id !== newParticipant.id
                  );
                  return [...filtered, newParticipant];
                });

                // Connect to the new user
                setTimeout(() => connectToNewUser(newParticipant.id), 1000);
              }
            }
          }
        )
        // Listen for participant status updates (database UPDATE)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "video_room_participants",
            filter: `room_id=eq.${roomIdToListen}`,
          },
          async (payload) => {
            console.log("📊 Participant status updated:", payload.new);

            if (payload.new.user_id !== currentUser.id) {
              // If participant left (left_at is not null) or disconnected
              if (
                payload.new.left_at ||
                payload.new.connection_status === "disconnected"
              ) {
                console.log("👋 Participant left:", payload.new.user_id);

                // Clean up peer connection and stream
                if (peerConnectionsRef.current[payload.new.user_id]) {
                  peerConnectionsRef.current[payload.new.user_id].close();
                  delete peerConnectionsRef.current[payload.new.user_id];
                }

                // Remove participant stream
                removeParticipantStream(payload.new.user_id);

                // Remove from participants list
                setParticipants((prev) =>
                  prev.filter((p) => p.id !== payload.new.user_id)
                );
              }
              // If participant reconnected
              else if (
                payload.new.connection_status === "connected" &&
                !payload.new.left_at
              ) {
                // Re-fetch participant info and add back
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", payload.new.user_id)
                  .single();

                if (profile) {
                  const reconnectedParticipant: VideoCallUser = {
                    id: profile.id,
                    username: profile.username,
                    full_name: profile.full_name,
                    avatar_url: profile.avatar_url,
                  };

                  console.log(
                    "🔄 Participant reconnected:",
                    reconnectedParticipant
                  );
                  setParticipants((prev) => {
                    const filtered = prev.filter(
                      (p) => p.id !== reconnectedParticipant.id
                    );
                    return [...filtered, reconnectedParticipant];
                  });

                  // Reconnect to the user
                  setTimeout(
                    () => connectToNewUser(reconnectedParticipant.id),
                    1000
                  );
                }
              }
            }
          }
        )
        // Listen for participant deletion (database DELETE)
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "video_room_participants",
            filter: `room_id=eq.${roomIdToListen}`,
          },
          (payload) => {
            console.log("📊 Participant deleted from database:", payload.old);

            if (payload.old.user_id !== currentUser.id) {
              console.log(
                "👋 Participant completely left:",
                payload.old.user_id
              );

              // Clean up peer connection and stream
              if (peerConnectionsRef.current[payload.old.user_id]) {
                peerConnectionsRef.current[payload.old.user_id].close();
                delete peerConnectionsRef.current[payload.old.user_id];
              }

              // Remove participant stream
              removeParticipantStream(payload.old.user_id);

              // Remove from participants list
              setParticipants((prev) =>
                prev.filter((p) => p.id !== payload.old.user_id)
              );
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
      console.log(
        "✅ Real-time listeners set up for WebRTC signaling and participant tracking"
      );

      // Fetch current participants when setting up listeners
      fetchCurrentParticipants(roomIdToListen);
    },
    [
      currentUser,
      supabase,
      handleSignalingMessage,
      connectToNewUser,
      fetchCurrentParticipants,
      removeParticipantStream,
    ]
  );

  // Notify other users when we join (replacing Socket.io emit)
  const notifyUserConnected = useCallback(() => {
    if (channelRef.current && currentUser) {
      channelRef.current.send({
        type: "broadcast",
        event: "user-connected",
        payload: {
          userId: currentUser.id,
        },
      });
    }
  }, [currentUser]);

  // Create room
  const createRoom = useCallback(
    async (roomType: string = "peer_to_peer", participantUserId?: string) => {
      try {
        if (!currentUser) return null;

        // Generate unique room ID
        const newRoomId = Math.random().toString(36).substring(2, 15);

        // Create room in database
        const { data, error } = await supabase
          .from("video_rooms")
          .insert({
            room_id: newRoomId,
            host_user_id: currentUser.id,
            status: "waiting",
            metadata: { room_type: roomType },
          })
          .select()
          .single();

        if (error) throw error;

        // Add creator as participant
        const { error: participantError } = await supabase
          .from("video_room_participants")
          .insert({
            room_id: newRoomId,
            user_id: currentUser.id,
            is_host: true,
            connection_status: "connecting",
          });

        if (participantError) throw participantError;

        setRoomId(newRoomId);
        setRoomStatus("waiting");

        console.log("✅ Created room:", data);
        toast.success(`Room created: ${newRoomId}`);
        return newRoomId;
      } catch (error) {
        console.error("❌ Error creating room:", error);
        toast.error("Failed to create video room");
        return null;
      }
    },
    [supabase, currentUser]
  );

  // Join room (WebDevSimplified approach with Supabase)
  const joinRoom = useCallback(
    async (roomIdToJoin: string) => {
      if (!currentUser) return false;

      try {
        console.log("🔄 Starting to join room:", roomIdToJoin);
        setIsConnecting(true);

        // Check if room exists and is active
        console.log("📋 Checking if room exists...");
        const { data: room, error: roomError } = await supabase
          .from("video_rooms")
          .select("*")
          .eq("room_id", roomIdToJoin)
          .single();

        if (roomError || !room) {
          console.error("❌ Room error:", roomError);
          throw new Error("Room not found or inactive");
        }
        console.log("✅ Room found:", room);

        // Get user media first (WebDevSimplified getUserMedia)
        console.log("🎥 Requesting camera and microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled,
        });
        console.log("✅ Media access granted");

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Add user as participant
        console.log("👥 Adding user as participant...");
        const { error: participantError } = await supabase
          .from("video_room_participants")
          .upsert(
            {
              room_id: roomIdToJoin,
              user_id: currentUser.id,
              is_host: room.host_user_id === currentUser.id,
              connection_status: "connected",
              joined_at: new Date().toISOString(),
              left_at: null, // Ensure left_at is null for active participants
            },
            {
              onConflict: "room_id,user_id",
            }
          );

        if (participantError) {
          console.error("❌ Participant error:", participantError);
          throw participantError;
        }
        console.log("✅ Added as participant");

        // Get all participants
        console.log("👥 Getting all participants...");
        const { data: participantData, error: participantsError } =
          await supabase
            .from("video_room_participants")
            .select(
              `
          user_id,
          is_host,
          connection_status,
          profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `
            )
            .eq("room_id", roomIdToJoin)
            .is("left_at", null);

        if (!participantsError && participantData) {
          const formattedParticipants = participantData
            .filter((p) => p.user_id !== currentUser.id)
            .map((p) => {
              const profile = Array.isArray(p.profiles)
                ? p.profiles[0]
                : p.profiles;
              return {
                id: profile?.id || p.user_id,
                username: profile?.username || "Unknown",
                full_name: profile?.full_name,
                avatar_url: profile?.avatar_url,
              };
            });
          setParticipants(formattedParticipants);
          console.log("✅ Participants loaded:", formattedParticipants.length);
        }

        // Update room status to active if it was waiting
        if (room.status === "waiting") {
          console.log("📡 Updating room status to active...");
          await supabase
            .from("video_rooms")
            .update({ status: "active" })
            .eq("room_id", roomIdToJoin);
        }

        setRoomId(roomIdToJoin);
        setIsInRoom(true);
        setRoomStatus(room.status === "waiting" ? "active" : room.status);
        setIsConnecting(false);

        // Set up real-time listeners for this room (replacing Socket.io)
        setupRealtimeListeners(roomIdToJoin);

        // Notify other users we joined (replacing Socket.io emit)
        setTimeout(() => notifyUserConnected(), 500);

        console.log("🎉 Successfully joined room:", roomIdToJoin);
        toast.success(`Joined room: ${roomIdToJoin}`);
        return true;
      } catch (error) {
        console.error("❌ Error joining room:", error);
        toast.error("Failed to join video room");
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
          localStreamRef.current = null;
        }
        setIsConnecting(false);
        return false;
      }
    },
    [
      currentUser,
      isVideoEnabled,
      isAudioEnabled,
      supabase,
      setupRealtimeListeners,
      notifyUserConnected,
    ]
  );

  // Leave room (WebDevSimplified cleanup)
  const leaveRoom = useCallback(async () => {
    console.log("👋 Leaving room...");

    // Update participant status in database first
    if (currentUser && roomId) {
      try {
        const { error } = await supabase
          .from("video_room_participants")
          .update({
            left_at: new Date().toISOString(),
            connection_status: "disconnected",
          })
          .eq("room_id", roomId)
          .eq("user_id", currentUser.id);

        if (error) {
          console.error(
            "❌ Error updating participant status on leave:",
            error
          );
        } else {
          console.log("✅ Updated participant status to disconnected");
        }
      } catch (error) {
        console.error("❌ Error leaving room in database:", error);
      } finally {
        // route to browse room page
      }
    }

    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections and clean up streams
    Object.keys(peerConnectionsRef.current).forEach((userId) => {
      peerConnectionsRef.current[userId].close();
      removeParticipantStream(userId);
    });
    peerConnectionsRef.current = {};

    // Clean up local video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Clean up realtime channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Stop call timer
    stopCallTimer();

    // Reset state
    setIsInRoom(false);
    setParticipants([]);
    setRoomStatus("ended");

    console.log("✅ Left room successfully");
  }, [currentUser, roomId, supabase, stopCallTimer, removeParticipantStream]);

  // Toggle video (WebDevSimplified approach)
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log("🎥 Video", videoTrack.enabled ? "enabled" : "disabled");
      }
    }
  }, []);

  // Toggle audio (WebDevSimplified approach)
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log("🎤 Audio", audioTrack.enabled ? "enabled" : "disabled");
      }
    }
  }, []);

  // Auto-join room if specified
  useEffect(() => {
    if (
      autoJoin &&
      initialRoomId &&
      currentUser &&
      !isInRoom &&
      !isConnecting
    ) {
      joinRoom(initialRoomId);
    }
  }, [autoJoin, initialRoomId, currentUser, isInRoom, isConnecting, joinRoom]);

  // Handle page close/refresh to clean up participant status
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentUser && roomId && isInRoom) {
        // Use navigator.sendBeacon for reliable cleanup on page unload
        const data = JSON.stringify({
          room_id: roomId,
          user_id: currentUser.id,
          left_at: new Date().toISOString(),
          connection_status: "disconnected",
        });

        // Try to send cleanup signal
        try {
          navigator.sendBeacon("/api/video/leave-room", data);
        } catch (error) {
          console.warn("❌ Could not send cleanup beacon:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUser, roomId, isInRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  return {
    // State
    roomId,
    isInRoom,
    participants,
    participantStreams,
    isConnecting,
    isVideoEnabled,
    isAudioEnabled,
    callDuration,
    currentUser,
    roomStatus,

    // Refs (for video elements)
    localVideoRef,

    // Stream utilities
    getParticipantStreamsWithInfo,
    removeParticipantStream,

    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
  };
}
