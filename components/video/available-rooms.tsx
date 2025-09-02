"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Users, Clock, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AvailableRoom {
  room_id: string;
  status: string;
  created_at: string;
  host_user_id: string;
  participants: {
    user_id: string;
    is_host: boolean;
    profiles: {
      username: string;
      full_name: string;
    };
  }[];
  _count: {
    participants: number;
  };
}

interface AvailableRoomsProps {
  onJoinRoom: (roomId: string) => void;
  currentUserId?: string | null;
}

export function AvailableRooms({ onJoinRoom, currentUserId }: AvailableRoomsProps) {
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadAvailableRooms();
    
    // Set up real-time subscription for room updates
    const channel = supabase
      .channel('room_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'video_rooms'
      }, () => {
        // Reload rooms when any room changes
        loadAvailableRooms();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'video_room_participants'
      }, () => {
        // Reload rooms when participants change
        loadAvailableRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAvailableRooms = async () => {
    try {
      // Get all active rooms with participant counts
      const { data: roomsData, error: roomsError } = await supabase
        .from('video_rooms')
        .select(`
          room_id,
          status,
          created_at,
          host_user_id,
          video_room_participants!inner (
            user_id,
            is_host,
            profiles (
              username,
              full_name
            )
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (roomsError) {
        console.error('Error loading rooms:', roomsError);
        toast.error('Failed to load available rooms');
        return;
      }

      // Group and count participants for each room
      const roomsWithCounts = roomsData?.reduce((acc: AvailableRoom[], room: any) => {
        // Find existing room in accumulator or create new one
        let roomData = acc.find(r => r.room_id === room.room_id);
        
        if (!roomData) {
          roomData = {
            room_id: room.room_id,
            status: room.status,
            created_at: room.created_at,
            host_user_id: room.host_user_id,
            participants: [],
            _count: { participants: 0 }
          };
          acc.push(roomData);
        }

        // Add participant if it exists and isn't already added
        if (room.video_room_participants && 
            !roomData.participants.find(p => p.user_id === room.video_room_participants.user_id)) {
          roomData.participants.push(room.video_room_participants);
        }

        roomData._count.participants = roomData.participants.length;
        
        return acc;
      }, []) || [];

      setRooms(roomsWithCounts);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Failed to load available rooms');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Available Rooms</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Rooms</h3>
        <p className="text-gray-500">Create a room to start a video call with others</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Available Rooms ({rooms.length})
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {rooms.map((room) => {
          const host = room.participants.find(p => p.is_host);
          const isMyRoom = room.host_user_id === currentUserId;
          
          return (
            <Card key={room.room_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-mono">
                      {room.room_id}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Host: {host?.profiles?.full_name || host?.profiles?.username || 'Unknown'}
                      {isMyRoom && (
                        <Badge variant="secondary" className="text-xs">Your Room</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {room._count.participants} participant{room._count.participants !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getTimeAgo(room.created_at)}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => onJoinRoom(room.room_id)}
                    disabled={isMyRoom}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {isMyRoom ? 'Your Room' : 'Join'}
                  </Button>
                </div>

                {/* Show participant list if more than 1 */}
                {room.participants.length > 1 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Participants:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.participants.map((participant) => (
                        <Badge 
                          key={participant.user_id} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {participant.profiles?.full_name || participant.profiles?.username}
                          {participant.is_host && ' (Host)'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
