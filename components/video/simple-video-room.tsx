"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, Phone, Users, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface SimpleVideoRoomProps {
  roomId: string;
  onLeave: () => void;
}

export function SimpleVideoRoom({ roomId, onLeave }: SimpleVideoRoomProps) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [roomStatus, setRoomStatus] = useState<string>('checking');
  const [participants, setParticipants] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClient();

  useEffect(() => {
    initializeRoom();
  }, [roomId]);

  const initializeRoom = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Please log in to join the video room");
        setIsConnecting(false);
        return;
      }

      // Check if room exists
      const { data: room, error: roomError } = await supabase
        .from('video_rooms')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (roomError) {
        console.error('Room error:', roomError);
        setError(`Room not found: ${roomError.message}`);
        setIsConnecting(false);
        return;
      }

      if (!room) {
        setError("Room not found");
        setIsConnecting(false);
        return;
      }

      setRoomStatus(room.status);

      // Get user media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Join the room by adding/updating participant
        const { error: participantError } = await supabase
          .from('video_room_participants')
          .upsert({
            room_id: roomId,
            user_id: user.id,
            is_host: room.host_user_id === user.id,
            connection_status: 'connected'
          }, {
            onConflict: 'room_id,user_id'
          });

        if (participantError) {
          console.error('Participant error:', participantError);
          setError(`Failed to join room: ${participantError.message}`);
          setIsConnecting(false);
          return;
        }

        // Get participants - with better error handling for RLS
        const { data: participantData, error: participantsError } = await supabase
          .from('video_room_participants')
          .select(`
            user_id,
            is_host,
            connection_status,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('room_id', roomId)
          .is('left_at', null);

        if (participantsError) {
          console.error('Participants error:', participantsError);
          // Don't fail the whole room join if we can't get participants
          // The user can still use the room
          setParticipants([]);
        } else {
          setParticipants(participantData || []);
        }

        toast.success("Successfully joined video room!");
        setIsConnecting(false);

      } catch (mediaError) {
        console.error('Media error:', mediaError);
        setError("Could not access camera/microphone");
        setIsConnecting(false);
      }

    } catch (error) {
      console.error('Error initializing room:', error);
      setError(`Failed to initialize room: ${error}`);
      setIsConnecting(false);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard!');
  };

  const handleEndCall = () => {
    // Clean up media stream
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    onLeave();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <Card className="p-8 text-center bg-gray-800 border-gray-700 text-white max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Room Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Room ID: {roomId}</p>
            <Button onClick={handleEndCall} variant="outline">
              Go Back
            </Button>
            <Button onClick={initializeRoom} className="ml-2">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <Card className="p-8 text-center bg-gray-800 border-gray-700 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Connecting to video room...</h3>
          <p className="text-gray-400">Please wait while we establish the connection</p>
          <div className="mt-4 text-sm text-gray-500">
            Room: {roomId}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Local Video */}
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

        {/* Room Info */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-mono text-lg">Room: {roomId}</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Participants Info */}
        {participants.length > 0 && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 max-w-xs">
            <h4 className="text-white font-semibold mb-2">Participants:</h4>
            <div className="space-y-1">
              {participants.slice(0, 5).map((participant) => (
                <div key={participant.user_id} className="flex items-center gap-2 text-white text-sm">
                  <div className={`w-2 h-2 rounded-full ${participant.connection_status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>{participant.profiles.full_name || participant.profiles.username}</span>
                  {participant.is_host && <span className="text-xs bg-blue-600 px-1 rounded">Host</span>}
                </div>
              ))}
            </div>
          </div>
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
      </div>
    </div>
  );
}
