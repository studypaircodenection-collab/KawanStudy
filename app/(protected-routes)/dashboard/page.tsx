"use client";

import { useState } from "react";
import { GamificationDashboard } from "@/components/gamification/gamification-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoCallLauncher } from "@/components/video/video-call-launcher";
import { SimpleVideoRoom } from "@/components/video/simple-video-room";
import { Video, BookOpen, Users, Calendar, MessageSquare, Settings, Plus, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ProtectedPage() {
  const [currentVideoRoom, setCurrentVideoRoom] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const supabase = createClient();

  const handleCreateVideoRoom = async () => {
    try {
      setIsCreatingRoom(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Please log in to create a video room");
        return;
      }

      // Generate a unique room ID
      const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Create room in database using the correct schema
      const { error: roomError } = await supabase
        .from('video_rooms')
        .insert({
          room_id: roomId,
          host_user_id: user.id,
          room_type: 'peer_to_peer',
          status: 'waiting',
          metadata: {}
        });

      if (roomError) {
        console.error('Error creating room:', roomError);
        toast.error("Failed to create video room");
        return;
      }

      // Add creator as first participant
      const { error: participantError } = await supabase
        .from('video_room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          is_host: true,
          connection_status: 'connecting'
        });

      if (participantError) {
        console.error('Error adding participant:', participantError);
        // Continue anyway, as the room was created
      }

      setCurrentVideoRoom(roomId);
      toast.success(`Video room created! Room ID: ${roomId}`);
      
    } catch (error) {
      console.error('Error creating video room:', error);
      toast.error("Failed to create video room");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinVideoRoom = async (roomId: string) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Please log in to join a video room");
        return;
      }

      // Check if room exists
      const { data: room, error: roomError } = await supabase
        .from('video_rooms')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (roomError || !room) {
        toast.error("Room not found or has ended");
        return;
      }

      // Add user as participant (or update if already exists)
      const { error: participantError } = await supabase
        .from('video_room_participants')
        .upsert({
          room_id: roomId,
          user_id: user.id,
          left_at: null
        }, {
          onConflict: 'room_id,user_id'
        });

      if (participantError) {
        console.error('Error joining room:', participantError);
        toast.error("Failed to join room");
        return;
      }

      setCurrentVideoRoom(roomId);
      toast.success("Joined video room successfully!");
      
    } catch (error) {
      console.error('Error joining video room:', error);
      toast.error("Failed to join video room");
    }
  };

  const handleLeaveVideoRoom = async () => {
    if (!currentVideoRoom) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Mark participant as left
        await supabase
          .from('video_room_participants')
          .update({ left_at: new Date().toISOString() })
          .eq('room_id', currentVideoRoom)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }

    setCurrentVideoRoom(null);
  };

  // If in a video call, show the video room
  if (currentVideoRoom) {
    return (
      <SimpleVideoRoom 
        roomId={currentVideoRoom} 
        onLeave={handleLeaveVideoRoom} 
      />
    );
  }
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your StudyPair overview.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer">
          <CardContent 
            className="p-4" 
            onClick={handleCreateVideoRoom}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Video Calls</p>
                <p className="text-lg font-semibold">
                  {isCreatingRoom ? "Creating..." : "Create Room"}
                </p>
              </div>
              <Video className={`w-8 h-8 text-blue-200 ${isCreatingRoom ? 'animate-pulse' : ''}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all cursor-pointer">
          <Link href="/dashboard/tutor">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Tutoring</p>
                  <p className="text-lg font-semibold">My Sessions</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Study Groups</p>
                <p className="text-lg font-semibold">Join Groups</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Schedule</p>
                <p className="text-lg font-semibold">View Calendar</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Features */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Calling Feature */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" />
              Video Calling
            </CardTitle>
            <CardDescription>
              Connect face-to-face with your study partners using our built-in video calling system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">WebRTC-Powered Calls</h4>
              <p className="text-sm text-muted-foreground mb-3">
                High-quality, peer-to-peer video calls with no external software required. 
                Create rooms instantly or join existing sessions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleCreateVideoRoom}
                  disabled={isCreatingRoom}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Video className={`w-4 h-4 mr-2 ${isCreatingRoom ? 'animate-pulse' : ''}`} />
                  {isCreatingRoom ? "Creating Room..." : "Create New Room"}
                </Button>
                
                <VideoCallLauncher 
                  onJoinRoom={handleJoinVideoRoom}
                  onCreateRoom={handleCreateVideoRoom}
                >
                  <Button variant="outline" className="flex-1" size="lg">
                    <Users className="w-4 h-4 mr-2" />
                    Join Existing Room
                  </Button>
                </VideoCallLauncher>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-sm font-medium">Instant Connect</p>
                <p className="text-xs text-muted-foreground">No downloads required</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Users className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-medium">Group Calls</p>
                <p className="text-xs text-muted-foreground">Multiple participants</p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/video-call">
                <Button variant="ghost" className="w-full justify-between">
                  Learn more about video calling
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Video call completed</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">New tutoring session</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-muted-foreground">Study group joined</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={handleCreateVideoRoom}
                disabled={isCreatingRoom}
                variant="outline" 
                className="w-full justify-start bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Video className={`w-4 h-4 mr-2 ${isCreatingRoom ? 'animate-pulse' : ''}`} />
                {isCreatingRoom ? "Creating..." : "Quick Video Room"}
              </Button>
              <VideoCallLauncher 
                onJoinRoom={handleJoinVideoRoom}
                onCreateRoom={handleCreateVideoRoom}
              >
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Join Video Room
                </Button>
              </VideoCallLauncher>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/tutor/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* <GamificationDashboard /> */}
    </div>
  );
}
