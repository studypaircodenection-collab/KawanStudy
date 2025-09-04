"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Users,
  Copy,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useVideoCall } from "@/hooks/use-video-call";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MultiUserVideoRoomProps {
  roomId: string;
  onLeave: () => void;
}

// WebDevSimplified style video grid component
export function WebRTCVideoRoom({ roomId, onLeave }: MultiUserVideoRoomProps) {
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Grid of video elements for multiple participants (WebDevSimplified approach)
  const videoGridRef = useRef<HTMLDivElement>(null);
  const participantVideosRef = useRef<{ [userId: string]: HTMLVideoElement }>(
    {}
  );

  const {
    isInRoom,
    isConnecting,
    participants,
    participantStreams,
    isVideoEnabled,
    isAudioEnabled,
    currentUser,
    roomStatus,
    callDuration,
    localVideoRef,
    getParticipantStreamsWithInfo,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
  } = useVideoCall({ roomId, autoJoin: true });

  // Auto-hide controls after 3 seconds (like original Zoom clone)
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  }, [controlsTimeout]);

  // Dynamic video element management for multiple participants
  const createVideoElement = useCallback(
    (stream: MediaStream, userId: string) => {
      // Create or update video element for this participant
      let videoElement = participantVideosRef.current[userId];

      if (!videoElement) {
        videoElement = document.createElement("video");
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "cover";
        participantVideosRef.current[userId] = videoElement;
      }

      videoElement.srcObject = stream;
      return videoElement;
    },
    []
  );

  // Get participant streams with user information
  const participantStreamData = getParticipantStreamsWithInfo();

  // Custom video component for participant streams
  const ParticipantVideo = ({
    stream,
    participant,
    className = "",
  }: {
    stream: MediaStream;
    participant: any;
    className?: string;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div
        className={`relative bg-gray-800 rounded-lg overflow-hidden ${className}`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Participant info overlay */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-white text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{participant?.full_name || participant?.username}</span>
        </div>
      </div>
    );
  };
  const handleEndCall = async () => {
    await leaveRoom();
    onLeave();
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // Loading state
  if (isConnecting || !currentUser) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <Card className="p-8 text-center bg-gray-800 border-gray-700 text-white max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">
            {!currentUser
              ? "Loading user profile..."
              : "Connecting to video room..."}
          </h3>
          <p className="text-gray-400 mb-2">
            {!currentUser ? "Please wait" : "Setting up WebRTC connections..."}
          </p>
          <div className="text-sm text-gray-500">Room: {roomId}</div>
        </Card>
      </div>
    );
  }

  // Failed to join room
  if (!isInRoom) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <Card className="p-8 text-center bg-gray-800 border-gray-700 text-white max-w-md">
          <Phone className="w-16 h-16 text-red-500 mx-auto mb-4 rotate-[135deg]" />
          <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
          <p className="text-gray-400 mb-4">
            Unable to join the video room. Please check your connection.
          </p>
          <Button onClick={onLeave} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Waiting for participants
  if (participantStreamData.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-gray-900 z-50"
        onMouseMove={handleMouseMove}
      >
        {/* Local video preview */}
        <div className="w-full h-full relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoOff className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-white text-lg">Camera is off</p>
              </div>
            </div>
          )}

          {/* Waiting overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Card className="p-8 text-center bg-gray-800/90 border-gray-700 text-white">
              <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Waiting for others to join...
              </h3>
              <p className="text-gray-300 mb-6">
                Share this room ID with others to start the call
              </p>

              <div className="bg-gray-700 rounded-lg p-3 mb-4 flex items-center justify-between">
                <code className="text-blue-300 text-sm">{roomId}</code>
                <Button
                  onClick={copyRoomId}
                  size="sm"
                  variant="outline"
                  className="ml-2 bg-gray-600 border-gray-500 hover:bg-gray-500"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-gray-400">
                Your camera and microphone are ready. Others will see you when
                they join.
              </p>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="w-14 h-14 rounded-full"
              >
                {isVideoEnabled ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="w-14 h-14 rounded-full"
              >
                {isAudioEnabled ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700"
              >
                <Phone className="w-6 h-6 rotate-[135deg]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main video call interface - Dynamic grid for multiple participants
  return (
    <div
      className="fixed inset-0 bg-gray-900 z-50"
      onMouseMove={handleMouseMove}
    >
      {/* Video Grid - Dynamic sizing based on participant count */}
      <div
        ref={videoGridRef}
        className="video-grid w-full h-full p-4 grid gap-4"
        style={{
          gridTemplateColumns:
            participantStreamData.length <= 1
              ? "1fr"
              : participantStreamData.length <= 4
              ? "repeat(2, 1fr)"
              : participantStreamData.length <= 9
              ? "repeat(3, 1fr)"
              : "repeat(4, 1fr)",
          gridAutoRows:
            participantStreamData.length <= 1
              ? "1fr"
              : participantStreamData.length <= 4
              ? "1fr"
              : "minmax(250px, 1fr)",
        }}
      >
        {/* Local Video - Always show current user */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-2">
                  <AvatarImage src={currentUser?.avatar_url} />
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {currentUser?.full_name?.[0] || currentUser?.username[0]}
                  </AvatarFallback>
                </Avatar>
                <VideoOff className="w-8 h-8 text-gray-400 mx-auto" />
              </div>
            </div>
          )}

          {/* User info overlay */}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-white text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{currentUser?.full_name || currentUser?.username} (You)</span>
          </div>
        </div>

        {/* Other Participants - Show all connected participants */}
        {participantStreamData.map((participantStream) => (
          <ParticipantVideo
            key={participantStream.userId}
            stream={participantStream.stream}
            participant={participantStream.user}
          />
        ))}
      </div>

      {/* Call Info */}
      <div
        className={`absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-30"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-mono text-lg">{callDuration}</span>
          </div>

          {participantStreamData.length > 0 && (
            <>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {participantStreamData.length + 1} participants
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-center gap-4">
            {/* Toggle Video */}
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </Button>

            {/* Toggle Audio */}
            {/* Toggle Audio */}
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700"
            >
              <Phone className="w-6 h-6 rotate-[135deg]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Room ID display */}
      <div
        className={`absolute bottom-4 right-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-30"
        }`}
      >
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
          <div className="flex items-center gap-2">
            <span>Room:</span>
            <code className="text-blue-300">{roomId}</code>
            <Button
              onClick={copyRoomId}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-white/20"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
