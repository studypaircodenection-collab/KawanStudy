"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function VideoDebugPage() {
  const [testRoomId, setTestRoomId] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const supabase = createClient();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCreateRoom = async () => {
    try {
      addResult('🔄 Testing room creation...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        addResult('❌ Not authenticated');
        return;
      }
      
      // Generate room ID
      const roomId = Math.random().toString(36).substring(2, 15);
      
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('video_rooms')
        .insert({
          room_id: roomId,
          host_user_id: user.id,
          status: 'active',
          metadata: {}
        })
        .select()
        .single();

      if (roomError) {
        addResult(`❌ Room creation failed: ${roomError.message}`);
        return;
      }

      addResult(`✅ Room created: ${roomId}`);
      setTestRoomId(roomId);

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('video_room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          is_host: true,
          connection_status: 'connected'
        });

      if (participantError) {
        addResult(`❌ Participant addition failed: ${participantError.message}`);
        return;
      }

      addResult(`✅ Host added as participant`);
      toast.success(`Test room created: ${roomId}`);
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
    }
  };

  const testJoinRoom = async () => {
    if (!testRoomId) {
      addResult('❌ No room ID to join');
      return;
    }

    try {
      addResult('🔄 Testing room joining...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        addResult('❌ Not authenticated');
        return;
      }

      // Check if room exists
      const { data: room, error: roomError } = await supabase
        .from('video_rooms')
        .select('*')
        .eq('room_id', testRoomId)
        .single();

      if (roomError) {
        addResult(`❌ Room query failed: ${roomError.message}`);
        return;
      }

      if (!room) {
        addResult(`❌ Room not found: ${testRoomId}`);
        return;
      }

      addResult(`✅ Room found: ${room.room_id} (status: ${room.status})`);

      // Join room
      const { error: joinError } = await supabase
        .from('video_room_participants')
        .upsert({
          room_id: testRoomId,
          user_id: user.id,
          is_host: false,
          connection_status: 'connected'
        }, {
          onConflict: 'room_id,user_id'
        });

      if (joinError) {
        addResult(`❌ Join failed: ${joinError.message}`);
        return;
      }

      addResult(`✅ Successfully joined room ${testRoomId}`);
      toast.success(`Joined room: ${testRoomId}`);
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
    }
  };

  const testListRooms = async () => {
    try {
      addResult('🔄 Testing room listing...');
      
      // Get all active rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('video_rooms')
        .select(`
          room_id,
          status,
          created_at,
          host_user_id,
          video_room_participants (
            user_id,
            is_host,
            connection_status,
            profiles (
              username,
              full_name
            )
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (roomsError) {
        addResult(`❌ Room listing failed: ${roomsError.message}`);
        return;
      }

      addResult(`✅ Found ${rooms?.length || 0} active rooms`);
      
      rooms?.forEach((room, index) => {
        const participantCount = room.video_room_participants?.length || 0;
        addResult(`  ${index + 1}. Room ${room.room_id}: ${participantCount} participants`);
      });
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Video Call Debug Page</h1>
        <p className="text-muted-foreground">Test video call functionality and troubleshoot issues</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Operations</CardTitle>
            <CardDescription>Run tests to verify video call functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testCreateRoom} className="w-full">
              Create Test Room
            </Button>
            
            <div className="flex gap-2">
              <Input
                placeholder="Room ID (auto-filled after creation)"
                value={testRoomId}
                onChange={(e) => setTestRoomId(e.target.value)}
              />
              <Button onClick={testJoinRoom} variant="outline">
                Join
              </Button>
            </div>
            
            <Button onClick={testListRooms} variant="outline" className="w-full">
              List All Rooms
            </Button>
            
            <Button onClick={clearResults} variant="destructive" size="sm" className="w-full">
              Clear Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Real-time test results and debugging information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 italic">No test results yet. Run a test to see results here.</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
