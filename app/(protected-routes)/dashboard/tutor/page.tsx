"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VideoCallLauncher } from '@/components/video/video-call-launcher';
import { VideoRoom } from '@/components/video/video-room';
import { 
  Video, 
  Plus, 
  Search, 
  Clock, 
  User, 
  Calendar, 
  BookOpen,
  Users,
  DollarSign,
  Star,
  Filter,
  ArrowRight,
  Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

interface TutorSession {
  id: string;
  title: string;
  subject: string;
  duration: number;
  price: number;
  status: 'active' | 'scheduled' | 'completed';
  tutor_name: string;
  student_name: string;
  scheduled_time?: string;
}

export default function TutorPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TutorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVideoRoom, setCurrentVideoRoom] = useState<string | null>(null);

  useEffect(() => {
    fetchTutorSessions();
  }, []);

  const fetchTutorSessions = async () => {
    try {
      setLoading(true);
      
      // Mock data - in a real app, fetch from Supabase
      const mockSessions: TutorSession[] = [
        {
          id: '1',
          title: 'Advanced Calculus',
          subject: 'Mathematics',
          duration: 60,
          price: 45,
          status: 'active',
          tutor_name: 'Dr. Sarah Johnson',
          student_name: 'Alex Chen',
          scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
        },
        {
          id: '2',
          title: 'Physics Fundamentals',
          subject: 'Physics',
          duration: 90,
          price: 55,
          status: 'scheduled',
          tutor_name: 'Prof. Michael Davis',
          student_name: 'Emma Wilson',
          scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
        },
        {
          id: '3',
          title: 'Chemistry Lab Help',
          subject: 'Chemistry',
          duration: 45,
          price: 40,
          status: 'completed',
          tutor_name: 'Dr. Lisa Brown',
          student_name: 'James Rodriguez'
        }
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching tutor sessions:', error);
      toast.error('Failed to load tutoring sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVideoCall = () => {
    const roomId = `quick-tutor-${Date.now()}`;
    setCurrentVideoRoom(roomId);
  };

  const handleJoinVideoRoom = (roomId: string) => {
    setCurrentVideoRoom(roomId);
  };

  const handleLeaveVideoRoom = () => {
    setCurrentVideoRoom(null);
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.tutor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tutoring Sessions</h1>
          <p className="text-muted-foreground">Manage your tutoring sessions and connect with students</p>
        </div>
        
        <div className="flex gap-2">
          <VideoCallLauncher 
            onJoinRoom={handleJoinVideoRoom}
            onCreateRoom={handleQuickVideoCall}
          >
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Video className="w-4 h-4 mr-2" />
              Quick Call
            </Button>
          </VideoCallLauncher>
          
          <Button asChild>
            <Link href="/dashboard/tutor/create">
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Sessions</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'active').length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'completed').length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Scheduled</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'scheduled').length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 cursor-pointer transition-colors">
          <CardContent className="p-4 h-full flex items-center justify-center">
            <VideoCallLauncher 
              onJoinRoom={handleJoinVideoRoom}
              onCreateRoom={handleQuickVideoCall}
            >
              <div className="text-center">
                <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Quick Call</p>
              </div>
            </VideoCallLauncher>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No sessions match your search criteria.' : 'You haven\'t created any tutoring sessions yet.'}
              </p>
              <Button asChild>
                <Link href="/dashboard/tutor/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Session
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Subject Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <BookOpen className="w-8 h-8" />
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{session.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{session.subject}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.duration} min
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${session.price}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {session.tutor_name}
                          </div>
                        </div>

                        {session.scheduled_time && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(session.scheduled_time).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={
                            session.status === 'active' ? 'default' : 
                            session.status === 'scheduled' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button asChild size="sm">
                        <Link href={`/dashboard/tutor/${session.id}`}>
                          <ArrowRight className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                      
                      {session.status === 'active' && (
                        <VideoCallLauncher 
                          onJoinRoom={handleJoinVideoRoom}
                          onCreateRoom={handleQuickVideoCall}
                        >
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Video className="w-4 h-4 mr-1" />
                            Start Call
                          </Button>
                        </VideoCallLauncher>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
