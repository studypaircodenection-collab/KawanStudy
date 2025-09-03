/**
 * WebRTC Video Call Test Page
 * 
 * This page demonstrates the WebRTC implementation based on the WebDevSimplified Zoom clone,
 * but using Supabase Realtime instead of Socket.io for signaling.
 * 
 * Key features implemented:
 * 1. Real-time video and audio communication
 * 2. WebRTC peer-to-peer connections
 * 3. Supabase Realtime for signaling (replacing Socket.io)
 * 4. Grid layout for multiple participants
 * 5. Camera and microphone controls
 * 
 * Instructions:
 * 1. Open this page in two different browser tabs/windows
 * 2. Create a room in one tab
 * 3. Join the same room from the other tab
 * 4. Test video and audio functionality
 */

"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WebRTCVideoRoom } from '@/components/video/webrtc-video-room';
import { useVideoCall } from '@/hooks/use-video-call';
import { Video, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function WebRTCTestPage() {
  const [roomId, setRoomId] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [isInCall, setIsInCall] = useState(false);

  const { createRoom, currentUser } = useVideoCall();

  const handleCreateRoom = async () => {
    const newRoomId = await createRoom('test_room');
    if (newRoomId) {
      setCurrentRoomId(newRoomId);
      setIsInCall(true);
    }
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    setCurrentRoomId(roomId.trim());
    setIsInCall(true);
  };

  const handleLeaveCall = () => {
    setIsInCall(false);
    setCurrentRoomId('');
    setRoomId('');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading...</h3>
            <p className="text-gray-600">Setting up your profile</p>
          </div>
        </Card>
      </div>
    );
  }

  if (isInCall) {
    return <WebRTCVideoRoom roomId={currentRoomId} onLeave={handleLeaveCall} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            WebRTC Video Call Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test the WebRTC implementation based on WebDevSimplified's Zoom clone, 
            using Supabase Realtime instead of Socket.io for signaling.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Start a new video call room. Share the room ID with others to invite them.
              </p>
              <Button 
                onClick={handleCreateRoom}
                className="w-full"
                size="lg"
              >
                <Video className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Existing Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Enter a room ID to join an existing video call.
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <Button 
                  onClick={handleJoinRoom}
                  className="w-full"
                  size="lg"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Test WebRTC Functionality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <ol className="space-y-2">
                <li>
                  <strong>Camera/Microphone Permission:</strong> Your browser will request permission 
                  to access your camera and microphone when you join a room.
                </li>
                <li>
                  <strong>Create a Room:</strong> Click "Create Room" to start a new video call. 
                  You'll get a unique room ID.
                </li>
                <li>
                  <strong>Join from Another Device:</strong> Open this page in another browser tab, 
                  window, or device and use "Join Room" with the room ID.
                </li>
                <li>
                  <strong>WebRTC Features:</strong> Test video/audio toggle, real-time communication, 
                  and peer-to-peer connection establishment.
                </li>
                <li>
                  <strong>Signaling:</strong> The app uses Supabase Realtime channels for WebRTC 
                  signaling instead of Socket.io.
                </li>
              </ol>
              
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">WebRTC Implementation Details:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Uses native RTCPeerConnection API</li>
                  <li>• Supabase Realtime for signaling (offers, answers, ICE candidates)</li>
                  <li>• STUN servers for NAT traversal</li>
                  <li>• Grid layout supporting multiple participants</li>
                  <li>• Real-time video/audio stream management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current User Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Logged in as: <strong>{currentUser.full_name || currentUser.username}</strong>
        </div>
      </div>
    </div>
  );
}
