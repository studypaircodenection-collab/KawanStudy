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
      
      console.log('Created room:', data);
      toast.success(`Room created: ${newRoomId}`);
      return newRoomId;
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create video room');
      return null;
    }
  }, [supabase, currentUser]);

  // Join room
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

      // Get user media first
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
      setIsConnecting(false); // Set connecting to false on success
      
      // Set up real-time listeners for this room
      console.log('📡 Setting up real-time listeners...');
      if (!channelRef.current) {
        const channel = supabase
          .channel(`video_room_${roomIdToJoin}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'video_room_participants',
            filter: `room_id=eq.${roomIdToJoin}`
          }, (payload) => {
            console.log('New participant joined:', payload.new);
            // Reload participants when someone joins
            if (payload.new.user_id !== currentUser.id) {
              // TODO: Handle new participant joining for WebRTC
            }
          })
          .subscribe();
        
        channelRef.current = channel;
        console.log('✅ Real-time listeners set up');
      }
      
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
  }, [currentUser, isVideoEnabled, isAudioEnabled, supabase]);

  // Set up real-time listeners for WebRTC signaling (WebDevSimplified approach)
  const setupRealtimeListeners = useCallback((roomIdToListen: string) => {
    if (!currentUser) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`video_room_${roomIdToListen}`)
      // Listen for new participants joining
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'video_room_participants',
        filter: `room_id=eq.${roomIdToListen}`
      }, async (payload) => {
        console.log('New participant joined:', payload.new);
        
        if (payload.new.user_id !== currentUser.id) {
          // Get participant profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.user_id)
            .single();

          if (profile) {
            const newParticipant: VideoCallUser = {
              id: profile.id,
              username: profile.username,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url
            };

            setParticipants(prev => [...prev.filter(p => p.id !== newParticipant.id), newParticipant]);
            
            // Create peer connection for new user
            if (localStreamRef.current) {
              await createPeerConnection(newParticipant.id, true);
            }
          }
        }
      })
      // Listen for WebRTC signals
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'video_room_signals',
        filter: `room_id=eq.${roomIdToListen}`
      }, async (payload) => {
        const signal = payload.new;
        
        // Only process signals meant for us
        if (signal.to_user_id === currentUser.id || signal.to_user_id === null) {
          console.log('Received signal:', signal);
          await handleWebRTCSignal(signal);
        }
      })
      // Listen for room status changes
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'video_rooms',
        filter: `room_id=eq.${roomIdToListen}`
      }, (payload) => {
        console.log('Room updated:', payload.new);
        const newStatus = payload.new.status;
        setRoomStatus(newStatus);
        
        if (newStatus === 'active' && !callTimerRef.current) {
          startCallTimer();
        } else if (newStatus === 'ended') {
          endCall();
        }
      })
      .subscribe((status) => {
        console.log('Channel status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnecting(false);
        }
      });

    channelRef.current = channel;
  }, [currentUser, supabase]);

  // Create peer connection (WebDevSimplified approach)
  const createPeerConnection = useCallback(async (userId: string, isInitiator: boolean) => {
    if (!localStreamRef.current || peerConnectionsRef.current[userId]) return;

    const peerConnection = new RTCPeerConnection(iceServers);
    peerConnectionsRef.current[userId] = peerConnection;

    // Add local stream to peer connection
    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current!);
    });

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', userId);
      const [remoteStream] = event.streams;
      remoteStreamRef.current = remoteStream;
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', userId);
        await sendSignal(userId, 'ice-candidate', {
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state with', userId, ':', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setIsConnecting(false);
      }
    };

    // If we're the initiator, create and send offer
    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      console.log('Sending offer to:', userId);
      await sendSignal(userId, 'offer', {
        sdp: offer.sdp,
        type: offer.type
      });
    }
  }, []);

  // Handle WebRTC signals
  const handleWebRTCSignal = useCallback(async (signal: any) => {
    const { from_user_id, signal_type, signal_data } = signal;
    const peerConnection = peerConnectionsRef.current[from_user_id];

    switch (signal_type) {
      case 'offer':
        console.log('Received offer from:', from_user_id);
        
        if (!peerConnection && localStreamRef.current) {
          await createPeerConnection(from_user_id, false);
        }
        
        const pc = peerConnectionsRef.current[from_user_id];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          console.log('Sending answer to:', from_user_id);
          await sendSignal(from_user_id, 'answer', {
            sdp: answer.sdp,
            type: answer.type
          });
        }
        break;

      case 'answer':
        console.log('Received answer from:', from_user_id);
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal_data));
        }
        break;

      case 'ice-candidate':
        console.log('Received ICE candidate from:', from_user_id);
        if (peerConnection) {
          await peerConnection.addIceCandidate(new RTCIceCandidate({
            candidate: signal_data.candidate,
            sdpMLineIndex: signal_data.sdpMLineIndex,
            sdpMid: signal_data.sdpMid
          }));
        }
        break;
    }

    // Mark signal as processed
    await supabase
      .from('video_room_signals')
      .update({ processed: true })
      .eq('id', signal.id);
  }, [supabase]);

  // Send WebRTC signal via Supabase
  const sendSignal = useCallback(async (toUserId: string, signalType: string, signalData: any) => {
    try {
      const { error } = await supabase
        .from('video_room_signals')
        .insert({
          room_id: roomId,
          from_user_id: currentUser?.id,
          to_user_id: toUserId,
          signal_type: signalType,
          signal_data: signalData,
          processed: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending signal:', error);
    }
  }, [roomId, currentUser, supabase]);

  // Start call timer
  const startCallTimer = useCallback(() => {
    if (callTimerRef.current) return; // Already running
    
    callStartTimeRef.current = new Date();
    callTimerRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const elapsed = Date.now() - callStartTimeRef.current.getTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
  }, []);

  // Stop call timer
  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    callStartTimeRef.current = null;
    setCallDuration('00:00');
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!roomId || !currentUser) return;

    try {
      // Mark participant as left
      const { error } = await supabase
        .from('video_room_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // Clean up everything
      endCall();
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Error leaving room');
      endCall(); // Clean up anyway
    }
  }, [roomId, currentUser, supabase]);

  // End call and clean up
  const endCall = useCallback(() => {
    // Stop all streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }

    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Clean up channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Reset state
    setIsInRoom(false);
    setIsConnecting(false);
    setParticipants([]);
    setRoomStatus('ended');
    stopCallTimer();

    console.log('Call ended and cleaned up');
  }, [supabase, stopCallTimer]);

  // Auto join if roomId provided and autoJoin is true
  useEffect(() => {
    if (initialRoomId && autoJoin && currentUser && !isInRoom) {
      joinRoom(initialRoomId);
    }
  }, [initialRoomId, autoJoin, currentUser, isInRoom, joinRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

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
    
    // Refs
    localVideoRef,
    remoteVideoRef,
    
    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    endCall,
    toggleVideo,
    toggleAudio,
  };
}
