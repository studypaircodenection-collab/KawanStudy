"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Video, UserPlus, Plus, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';

interface VideoCallLauncherProps {
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  children?: React.ReactNode;
}

export function VideoCallLauncher({ onJoinRoom, onCreateRoom, children }: VideoCallLauncherProps) {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    
    onJoinRoom(joinRoomId.trim());
    setIsOpen(false);
    setJoinRoomId('');
  };

  const handleCreateRoom = () => {
    onCreateRoom();
    setIsOpen(false);
  };

  const generateSampleRoomId = () => {
    const sampleId = Math.random().toString(36).substring(2, 15);
    setJoinRoomId(sampleId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Start Video Call
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Call
          </DialogTitle>
          <DialogDescription>
            Start a new video call or join an existing room
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create New Room */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Start New Call
              </CardTitle>
              <CardDescription>
                Create a new video room and invite others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateRoom}
                className="w-full"
                size="lg"
              >
                <Users className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Join Existing Room */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Join Existing Call
              </CardTitle>
              <CardDescription>
                Enter a room ID to join an ongoing call
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-id">Room ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="room-id"
                      placeholder="Enter room ID..."
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSampleRoomId}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ask the room creator to share their room ID with you
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!joinRoomId.trim()}
                  size="lg"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            Video calls use WebRTC for secure peer-to-peer communication
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
