"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface VideoCallUser {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface UseVideoCallProps {
  roomId?: string;
  autoJoin?: boolean;
}

export function useVideoCall({ roomId: initialRoomId, autoJoin = false }: UseVideoCallProps = {}) {
  // State
  const [roomId, setRoomId] = useState<string>(initialRoomId || '');
  const [isInRoom, setIsInRoom] = useState(false);
  const [participants, setParticipants] = useState<VideoCallUser[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState('00:00');
  const [currentUser, setCurrentUser] = useState<VideoCallUser | null>(null);
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');

  // Refs for WebRTC
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const supabase = createClient();
  const channelRef = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);

  // WebRTC configuration (same as WebDevSimplified)
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentUser({
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          });
        }
      }
    }
    getCurrentUser();
  }, [supabase]);

  // Format call duration
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start call timer
  const startCallTimer = useCallback(() => {
    if (!callTimerRef.current) {
      callStartTimeRef.current = new Date();
      callTimerRef.current = setInterval(() => {
        if (callStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - callStartTimeRef.current.getTime()) / 1000);
          setCallDuration(formatDuration(elapsed));
        }
      }, 1000);
    }
  }, [formatDuration]);

  // Stop call timer
  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
      callStartTimeRef.current = null;
      setCallDuration('00:00');
    }
  }, []);

  // Create peer connection for a specific user (WebDevSimplified approach)
  const createPeerConnection = useCallback((userId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(iceServers);

    // Add local stream to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle remote stream (WebDevSimplified addVideoStream equivalent)
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', userId);
      const [remoteStream] = event.streams;
      remoteStreamRef.current = remoteStream;
      
      // Display remote stream in video element
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates (WebDevSimplified approach)
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        console.log('Sending ICE candidate to:', userId);
        channelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            targetUserId: userId,
            fromUserId: currentUser?.id
          }
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state for', userId, ':', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        console.log('✅ Connected to user:', userId);
        setRoomStatus('active');
        if (!callTimerRef.current) {
          startCallTimer();
        }
      } else if (peerConnection.connectionState === 'failed') {
        console.log('❌ Connection failed, attempting to restart ICE');
        peerConnection.restartIce();
      }
    };

    peerConnectionsRef.current[userId] = peerConnection;
    return peerConnection;
  }, [currentUser, iceServers, startCallTimer]);

  // Connect to a new user (WebDevSimplified connectToNewUser function)
  const connectToNewUser = useCallback(async (userId: string) => {
    if (!currentUser || !localStreamRef.current) return;

    console.log('🤝 Connecting to new user:', userId);
    const peerConnection = createPeerConnection(userId);

    try {
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer via Supabase Realtime (replacing Socket.io)
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'offer',
          payload: {
            offer,
            targetUserId: userId,
            fromUserId: currentUser.id
          }
        });
      }
    } catch (error) {
      console.error('❌ Error creating offer for user', userId, ':', error);
    }
  }, [currentUser, createPeerConnection]);

  // Handle incoming WebRTC signaling messages
  const handleSignalingMessage = useCallback(async (event: string, payload: any) => {
    if (!currentUser || payload.targetUserId !== currentUser.id) return;

    const { fromUserId } = payload;
    console.log(`📨 Received ${event} from:`, fromUserId);

    switch (event) {
      case 'offer':
        try {
          let peerConnection = peerConnectionsRef.current[fromUserId];
          if (!peerConnection) {
            peerConnection = createPeerConnection(fromUserId);
          }

          await peerConnection.setRemoteDescription(payload.offer);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          // Send answer back
          if (channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'answer',
              payload: {
                answer,
                targetUserId: fromUserId,
                fromUserId: currentUser.id
              }
            });
          }
        } catch (error) {
          console.error('❌ Error handling offer:', error);
        }
        break;

      case 'answer':
        try {
          const peerConnection = peerConnectionsRef.current[fromUserId];
          if (peerConnection) {
            await peerConnection.setRemoteDescription(payload.answer);
          }
        } catch (error) {
          console.error('❌ Error handling answer:', error);
        }
        break;

      case 'ice-candidate':
        try {
          const peerConnection = peerConnectionsRef.current[fromUserId];
          if (peerConnection && payload.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
          }
        } catch (error) {
          console.error('❌ Error handling ICE candidate:', error);
        }
        break;
    }
  }, [currentUser, createPeerConnection]);

  // Set up real-time listeners for WebRTC signaling (replacing Socket.io with Supabase Realtime)
  const setupRealtimeListeners = useCallback((roomIdToListen: string) => {
    if (!currentUser) return;

    console.log('📡 Setting up real-time listeners for room:', roomIdToListen);

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`video_room_${roomIdToListen}`)
      // Listen for WebRTC signaling messages (replacing Socket.io events)
      .on('broadcast', { event: 'user-connected' }, async (payload) => {
        const { userId } = payload.payload;
        if (userId !== currentUser.id) {
          console.log('👋 User connected:', userId);
          
          // Get user profile and add to participants
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profile) {
            const newParticipant: VideoCallUser = {
              id: profile.id,
              username: profile.username,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url
            };

            setParticipants(prev => [...prev.filter(p => p.id !== newParticipant.id), newParticipant]);
            
            // Connect to the new user (WebDevSimplified approach)
            setTimeout(() => connectToNewUser(userId), 1000);
          }
        }
      })
      .on('broadcast', { event: 'user-disconnected' }, (payload) => {
        const { userId } = payload.payload;
        if (userId !== currentUser.id) {
          console.log('👋 User disconnected:', userId);
          
          // Clean up peer connection (WebDevSimplified cleanup)
          if (peerConnectionsRef.current[userId]) {
            peerConnectionsRef.current[userId].close();
            delete peerConnectionsRef.current[userId];
          }

          // Remove from participants
          setParticipants(prev => prev.filter(p => p.id !== userId));
        }
      })
      .on('broadcast', { event: 'offer' }, (payload) => {
        handleSignalingMessage('offer', payload.payload);
      })
      .on('broadcast', { event: 'answer' }, (payload) => {
        handleSignalingMessage('answer', payload.payload);
      })
      .on('broadcast', { event: 'ice-candidate' }, (payload) => {
        handleSignalingMessage('ice-candidate', payload.payload);
      })
      // Listen for new participants joining (database changes)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'video_room_participants',
        filter: `room_id=eq.${roomIdToListen}`
      }, async (payload) => {
        console.log('📊 New participant joined database:', payload.new);
        
        if (payload.new.user_id !== currentUser.id) {
          // Broadcast user connection via realtime (replacing Socket.io emit)
          channel.send({
            type: 'broadcast',
            event: 'user-connected',
            payload: {
              userId: payload.new.user_id
            }
          });
        }
      })
      .subscribe();
    
    channelRef.current = channel;
    console.log('✅ Real-time listeners set up for WebRTC signaling');
  }, [currentUser, supabase, connectToNewUser, handleSignalingMessage]);

  // Notify other users when we join (replacing Socket.io emit)
  const notifyUserConnected = useCallback(() => {
    if (channelRef.current && currentUser) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'user-connected',
        payload: {
          userId: currentUser.id
        }
      });
    }
  }, [currentUser]);

  // Create room
  const createRoom = useCallback(async (roomType: string = 'peer_to_peer', participantUserId?: string) => {
    try {
      if (!currentUser) return null;

      // Generate unique room ID
      const newRoomId = Math.random().toString(36).substring(2, 15);

      // Create room in database
      const { data, error } = await supabase
        .from('video_rooms')
        .insert({
          room_id: newRoomId,
          host_user_id: currentUser.id,
          status: 'waiting',
          metadata: { room_type: roomType }
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('video_room_participants')
        .insert({
          room_id: newRoomId,
          user_id: currentUser.id,
          is_host: true,
          connection_status: 'connecting'
        });

      if (participantError) throw participantError;

      setRoomId(newRoomId);
      setRoomStatus('waiting');
      
      console.log('✅ Created room:', data);
      toast.success(`Room created: ${newRoomId}`);
      return newRoomId;
    } catch (error) {
      console.error('❌ Error creating room:', error);
      toast.error('Failed to create video room');
      return null;
    }
  }, [supabase, currentUser]);

  // Join room (WebDevSimplified approach with Supabase)
  const joinRoom = useCallback(async (roomIdToJoin: string) => {
    if (!currentUser) return false;

    try {
      console.log('🔄 Starting to join room:', roomIdToJoin);
      setIsConnecting(true);
      
      // Check if room exists and is active
      console.log('📋 Checking if room exists...');
      const { data: room, error: roomError } = await supabase
        .from('video_rooms')
        .select('*')
        .eq('room_id', roomIdToJoin)
        .single();

      if (roomError || !room) {
        console.error('❌ Room error:', roomError);
        throw new Error('Room not found or inactive');
      }
      console.log('✅ Room found:', room);

      // Get user media first (WebDevSimplified getUserMedia)
      console.log('🎥 Requesting camera and microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });
      console.log('✅ Media access granted');

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add user as participant
      console.log('👥 Adding user as participant...');
      const { error: participantError } = await supabase
        .from('video_room_participants')
        .upsert({
          room_id: roomIdToJoin,
          user_id: currentUser.id,
          is_host: room.host_user_id === currentUser.id,
          connection_status: 'connected'
        }, {
          onConflict: 'room_id,user_id'
        });

      if (participantError) {
        console.error('❌ Participant error:', participantError);
        throw participantError;
      }
      console.log('✅ Added as participant');

      // Get all participants
      console.log('👥 Getting all participants...');
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
        .eq('room_id', roomIdToJoin)
        .is('left_at', null);

      if (!participantsError && participantData) {
        const formattedParticipants = participantData
          .filter(p => p.user_id !== currentUser.id)
          .map(p => {
            const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
            return {
              id: profile?.id || p.user_id,
              username: profile?.username || 'Unknown',
              full_name: profile?.full_name,
              avatar_url: profile?.avatar_url
            };
          });
        setParticipants(formattedParticipants);
        console.log('✅ Participants loaded:', formattedParticipants.length);
      }

      // Update room status to active if it was waiting
      if (room.status === 'waiting') {
        console.log('📡 Updating room status to active...');
        await supabase
          .from('video_rooms')
          .update({ status: 'active' })
          .eq('room_id', roomIdToJoin);
      }

      setRoomId(roomIdToJoin);
      setIsInRoom(true);
      setRoomStatus(room.status === 'waiting' ? 'active' : room.status);
      setIsConnecting(false);
      
      // Set up real-time listeners for this room (replacing Socket.io)
      setupRealtimeListeners(roomIdToJoin);
      
      // Notify other users we joined (replacing Socket.io emit)
      setTimeout(() => notifyUserConnected(), 500);
      
      console.log('🎉 Successfully joined room:', roomIdToJoin);
      toast.success(`Joined room: ${roomIdToJoin}`);
      return true;
    } catch (error) {
      console.error('❌ Error joining room:', error);
      toast.error('Failed to join video room');
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      setIsConnecting(false);
      return false;
    }
  }, [currentUser, isVideoEnabled, isAudioEnabled, supabase, setupRealtimeListeners, notifyUserConnected]);

  // Leave room (WebDevSimplified cleanup)
  const leaveRoom = useCallback(async () => {
    console.log('👋 Leaving room...');
    
    // Notify other users we're disconnecting
    if (channelRef.current && currentUser) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'user-disconnected',
        payload: {
          userId: currentUser.id
        }
      });
    }

    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};

    // Clean up video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Clean up realtime channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Stop call timer
    stopCallTimer();

    // Update database
    if (currentUser && roomId) {
      await supabase
        .from('video_room_participants')
        .update({ 
          left_at: new Date().toISOString(),
          connection_status: 'disconnected' 
        })
        .eq('room_id', roomId)
        .eq('user_id', currentUser.id);
    }

    // Reset state
    setIsInRoom(false);
    setParticipants([]);
    setRoomStatus('ended');
    
    console.log('✅ Left room successfully');
  }, [currentUser, roomId, supabase, stopCallTimer]);

  // Toggle video (WebDevSimplified approach)
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log('🎥 Video', videoTrack.enabled ? 'enabled' : 'disabled');
      }
    }
  }, []);

  // Toggle audio (WebDevSimplified approach)
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log('🎤 Audio', audioTrack.enabled ? 'enabled' : 'disabled');
      }
    }
  }, []);

  // Auto-join room if specified
  useEffect(() => {
    if (autoJoin && initialRoomId && currentUser && !isInRoom && !isConnecting) {
      joinRoom(initialRoomId);
    }
  }, [autoJoin, initialRoomId, currentUser, isInRoom, isConnecting, joinRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  return {
    // State
    roomId,
    isInRoom,
    participants,
    isConnecting,
    isVideoEnabled,
    isAudioEnabled,
    callDuration,
    currentUser,
    roomStatus,
    
    // Refs (for video elements)
    localVideoRef,
    remoteVideoRef,
    
    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
  };
}
