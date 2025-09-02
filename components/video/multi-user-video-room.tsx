"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, Phone, Users, Copy, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useVideoCall } from '@/hooks/use-video-call';

interface MultiUserVideoRoomProps {
  roomId: string;
  onLeave: () => void;
}

export function MultiUserVideoRoom({ roomId, onLeave }: MultiUserVideoRoomProps) {
  const [showParticipants, setShowParticipants] = useState(true);
  const remoteVideosRef = useRef<{ [userId: string]: HTMLVideoElement | null }>({});

  const {
    isInRoom,
    isConnecting,
    participants,
    isVideoEnabled,
    isAudioEnabled,
    currentUser,
    roomStatus,
    callDuration,
    localVideoRef,
    remoteVideoRef,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
  } = useVideoCall({ roomId });

  // Auto-join room on mount
  useEffect(() => {
    console.log('🔍 MultiUserVideoRoom effect:', { roomId, isInRoom, currentUser });
    if (roomId && !isInRoom && currentUser) {
      console.log('🚀 Attempting to join room:', roomId);
      joinRoom(roomId);
    }
  }, [roomId, isInRoom, currentUser, joinRoom]);

  const handleEndCall = async () => {
    await leaveRoom();
    onLeave();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard!');
  };

  if (isConnecting || !currentUser) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <Card className="p-8 text-center bg-gray-800 border-gray-700 text-white max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">
            {!currentUser ? 'Loading user profile...' : 'Joining video room...'}
          </h3>
          <p className="text-gray-400 mb-2">
            {!currentUser ? 'Please wait' : 'Connecting to participants'}
          </p>
          <div className="text-sm text-gray-500">Room: {roomId}</div>
        </Card>
      </div>
    );
  }

  if (!isInRoom) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <Card className="p-8 text-center bg-gray-800 border-gray-700 text-white max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
          <p className="text-gray-400 mb-4">Unable to join the video room</p>
          <Button onClick={onLeave} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Video Grid */}
      <div className="w-full h-full relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
        
        {/* Local Video */}
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
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <VideoOff className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-white text-sm">You (Camera off)</p>
              </div>
            </div>
          )}

          {/* Local video label */}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
            <span className="text-white text-xs font-medium">
              {currentUser?.full_name || currentUser?.username || 'You'} (You)
            </span>
          </div>

          {/* Audio indicator */}
          <div className="absolute top-2 left-2">
            {isAudioEnabled ? (
              <Mic className="w-4 h-4 text-green-400" />
            ) : (
              <MicOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Remote Video - Main */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden md:col-span-1">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Placeholder for no remote participants */}
          {participants.length === 0 && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-white text-sm">Waiting for participants</p>
                <p className="text-gray-400 text-xs mt-1">Share room ID: {roomId}</p>
              </div>
            </div>
          )}

          {/* Remote participant label */}
          {participants.length > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
              <span className="text-white text-xs font-medium">
                {participants[0]?.full_name || participants[0]?.username || 'Participant'}
              </span>
            </div>
          )}
        </div>

        {/* Additional Remote Participants (if more than 1) */}
        {participants.slice(1).map((participant, index) => (
          <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={(el) => {
                if (el) remoteVideosRef.current[participant.id] = el;
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
              <span className="text-white text-xs font-medium">
                {participant.full_name || participant.username}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Room Info Bar */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-mono text-sm">Room: {roomId}</span>
          </div>
          <div className="w-px h-4 bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">{participants.length + 1} participant{participants.length !== 0 ? 's' : ''}</span>
          </div>
          <div className="w-px h-4 bg-gray-600"></div>
          <div className="text-sm">{callDuration}</div>
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && participants.length > 0 && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-semibold">Participants</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowParticipants(false)}
              className="text-white h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          <div className="space-y-1">
            {/* Current user */}
            <div className="flex items-center gap-2 text-white text-sm">
              <UserCheck className="w-3 h-3 text-green-400" />
              <span>{currentUser?.full_name || currentUser?.username} (You)</span>
            </div>
            {/* Remote participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 text-white text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>{participant.full_name || participant.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle participants button if hidden */}
      {!showParticipants && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowParticipants(true)}
          className="absolute top-4 right-4"
        >
          <Users className="w-4 h-4" />
        </Button>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="w-14 h-14 rounded-full"
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>

            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="w-14 h-14 rounded-full"
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={copyRoomId}
              className="w-14 h-14 rounded-full"
              title="Copy Room ID"
            >
              <Copy className="w-6 h-6" />
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

      {/* Room Status Indicator */}
      <div className="absolute bottom-6 right-6">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          roomStatus === 'active' 
            ? 'bg-green-600 text-white' 
            : roomStatus === 'waiting'
            ? 'bg-yellow-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {roomStatus === 'active' ? 'Live' : roomStatus === 'waiting' ? 'Waiting' : 'Ended'}
        </div>
      </div>
    </div>
  );
}
