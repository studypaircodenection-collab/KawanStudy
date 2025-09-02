"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoCallLauncher } from '@/components/video/video-call-launcher';
import { VideoRoom } from '@/components/video/video-room';
import { 
  Video, 
  Clock, 
  User, 
  Calendar, 
  ArrowLeft, 
  MessageSquare,
  FileText,
  Star,
  MapPin,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface TutorSession {
  id: string;
  title: string;
  subject: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  tutor: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
    rating: number;
    total_sessions: number;
  };
  student: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export default function TutorSessionPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<TutorSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVideoRoom, setCurrentVideoRoom] = useState<string | null>(null);
  
  const tutorId = params['tutor-id'] as string;

  useEffect(() => {
    fetchTutorSession();
  }, [tutorId]);

  const fetchTutorSession = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // For demo purposes, create mock data
      // In a real app, you'd fetch from your tutor_sessions table
      const mockSession: TutorSession = {
        id: tutorId,
        title: "Advanced Calculus Tutoring",
        subject: "Mathematics",
        description: "Comprehensive calculus tutoring covering derivatives, integrals, and differential equations. Perfect for university-level students.",
        price: 45,
        duration: 60,
        location: "Online",
        status: 'active',
        created_at: new Date().toISOString(),
        tutor: {
          id: "tutor-1",
          full_name: "Dr. Sarah Johnson",
          username: "dr_sarah_math",
          avatar_url: "",
          rating: 4.9,
          total_sessions: 127
        },
        student: {
          id: "student-1",
          full_name: "Alex Chen",
          username: "alex_student",
          avatar_url: ""
        }
      };

      setSession(mockSession);
    } catch (error) {
      console.error('Error fetching tutor session:', error);
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartVideoCall = () => {
    // Generate a room ID based on the session
    const roomId = `tutor-session-${tutorId}-${Date.now()}`;
    setCurrentVideoRoom(roomId);
  };

  const handleJoinVideoRoom = (roomId: string) => {
    setCurrentVideoRoom(roomId);
  };

  const handleLeaveVideoRoom = () => {
    setCurrentVideoRoom(null);
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
          <p className="text-muted-foreground mb-6">The tutoring session you're looking for doesn't exist.</p>
          <Button onClick={goBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  // If in a video call, show the video room
  if (currentVideoRoom) {
    return (
      <VideoRoom 
        roomId={currentVideoRoom} 
        onLeave={handleLeaveVideoRoom} 
      />
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{session.title}</h1>
          <p className="text-muted-foreground">Tutor Session Details</p>
        </div>
        <div className="ml-auto">
          <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
            {session.status}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{session.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">${session.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{session.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Subject</h4>
                <Badge variant="outline">{session.subject}</Badge>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{session.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Video Call Section */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Video className="w-5 h-5" />
                Video Call
              </CardTitle>
              <CardDescription>
                Connect with your tutor or student via secure video calling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleStartVideoCall}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Start Video Call
                </Button>
                
                <VideoCallLauncher 
                  onJoinRoom={handleJoinVideoRoom}
                  onCreateRoom={handleStartVideoCall}
                >
                  <Button variant="outline" className="flex-1" size="lg">
                    <User className="w-4 h-4 mr-2" />
                    Join Call
                  </Button>
                </VideoCallLauncher>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  High-quality video calls powered by WebRTC technology
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Session Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button variant="outline" className="justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tutor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tutor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={session.tutor.avatar_url} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {session.tutor.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{session.tutor.full_name}</h4>
                  <p className="text-sm text-muted-foreground">@{session.tutor.username}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{session.tutor.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sessions</span>
                  <span className="text-sm font-medium">{session.tutor.total_sessions}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={session.student.avatar_url} />
                  <AvatarFallback className="bg-green-600 text-white">
                    {session.student.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{session.student.full_name}</h4>
                  <p className="text-sm text-muted-foreground">@{session.student.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Created</span>
                  <span className="text-sm">{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
