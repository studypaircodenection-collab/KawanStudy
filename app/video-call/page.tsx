"use client";

import { useState } from 'react';
import { VideoRoom } from '@/components/video/video-room';
import { VideoCallLauncher } from '@/components/video/video-call-launcher';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, Users, Shield, Zap } from 'lucide-react';

export default function VideoCallPage() {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const router = useRouter();

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
  };

  const handleCreateRoom = () => {
    // Generate a random room ID
    const roomId = Math.random().toString(36).substring(2, 15);
    setCurrentRoomId(roomId);
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
  };

  const goBack = () => {
    router.back();
  };

  // If in a room, show the video interface
  if (currentRoomId) {
    return (
      <VideoRoom 
        roomId={currentRoomId} 
        onLeave={handleLeaveRoom} 
      />
    );
  }

  // Show the main video call landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Video Calls</h1>
            <p className="text-muted-foreground">Connect face-to-face with your study partners</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">Start Your Study Session</h2>
                  <p className="text-blue-100 mb-4">
                    High-quality video calls powered by WebRTC technology
                  </p>
                  <VideoCallLauncher 
                    onJoinRoom={handleJoinRoom}
                    onCreateRoom={handleCreateRoom}
                  >
                    <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                      <Video className="w-5 h-5 mr-2" />
                      Start Video Call
                    </Button>
                  </VideoCallLauncher>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <Video className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Instant Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join or create video rooms instantly with no downloads or plugins required. Just click and connect.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  Secure & Private
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  End-to-end encrypted video calls using WebRTC technology. Your conversations stay private.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Multi-Participant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Support for multiple participants in a single room. Perfect for group study sessions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with video calling in seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <VideoCallLauncher 
                  onJoinRoom={handleJoinRoom}
                  onCreateRoom={handleCreateRoom}
                >
                  <Button className="flex-1" size="lg">
                    <Video className="w-4 h-4 mr-2" />
                    New Video Call
                  </Button>
                </VideoCallLauncher>
                
                <VideoCallLauncher 
                  onJoinRoom={handleJoinRoom}
                  onCreateRoom={handleCreateRoom}
                >
                  <Button variant="outline" className="flex-1" size="lg">
                    <Users className="w-4 h-4 mr-2" />
                    Join Existing Call
                  </Button>
                </VideoCallLauncher>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Create or Join a Room</h4>
                    <p className="text-sm text-muted-foreground">Click "New Video Call" to create a room, or "Join Existing Call" to join with a room ID.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Share Room ID</h4>
                    <p className="text-sm text-muted-foreground">Share your room ID with others so they can join your video call.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Start Studying Together</h4>
                    <p className="text-sm text-muted-foreground">Use video, audio controls, and screen sharing to collaborate effectively.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
