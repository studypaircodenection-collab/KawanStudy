-- Create video_rooms table for WebRTC room management
CREATE TABLE IF NOT EXISTS video_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT UNIQUE NOT NULL,
  host_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL DEFAULT 'peer_to_peer', -- 'peer_to_peer', 'group', 'tutor_session'
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'ended'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}' -- Store additional room data
);

-- Create video_room_participants table for multi-user rooms
CREATE TABLE IF NOT EXISTS video_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES video_rooms(room_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_host BOOLEAN DEFAULT FALSE,
  peer_id TEXT, -- For WebRTC peer identification
  connection_status TEXT DEFAULT 'connecting', -- 'connecting', 'connected', 'disconnected'
  UNIQUE(room_id, user_id)
);

-- Create video_room_signals table for WebRTC signaling
CREATE TABLE IF NOT EXISTS video_room_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES video_rooms(room_id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for broadcast signals
  signal_type TEXT NOT NULL, -- 'offer', 'answer', 'ice-candidate', 'join', 'leave'
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_rooms_room_id ON video_rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_video_rooms_host_user_id ON video_rooms(host_user_id);
CREATE INDEX IF NOT EXISTS idx_video_rooms_status ON video_rooms(status);
CREATE INDEX IF NOT EXISTS idx_video_room_participants_room_id ON video_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_video_room_participants_user_id ON video_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_video_room_signals_room_id ON video_room_signals(room_id);
CREATE INDEX IF NOT EXISTS idx_video_room_signals_to_user_id ON video_room_signals(to_user_id);
CREATE INDEX IF NOT EXISTS idx_video_room_signals_processed ON video_room_signals(processed);

-- Enable RLS
ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_room_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_rooms
CREATE POLICY "Users can view rooms they're part of" ON video_rooms
  FOR SELECT USING (
    host_user_id = auth.uid() OR 
    participant_user_id = auth.uid() OR
    room_id IN (
      SELECT room_id FROM video_room_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms" ON video_rooms
  FOR INSERT WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Hosts can update their rooms" ON video_rooms
  FOR UPDATE USING (host_user_id = auth.uid());

-- RLS Policies for video_room_participants
CREATE POLICY "Users can view participants in their rooms" ON video_room_participants
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM video_rooms 
      WHERE host_user_id = auth.uid() OR participant_user_id = auth.uid()
    ) OR
    room_id IN (
      SELECT room_id FROM video_room_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms" ON video_room_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON video_room_participants
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for video_room_signals
CREATE POLICY "Users can view signals in their rooms" ON video_room_signals
  FOR SELECT USING (
    from_user_id = auth.uid() OR 
    to_user_id = auth.uid() OR 
    to_user_id IS NULL AND room_id IN (
      SELECT room_id FROM video_room_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create signals" ON video_room_signals
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update signals they created" ON video_room_signals
  FOR UPDATE USING (from_user_id = auth.uid());

-- Functions for room management
CREATE OR REPLACE FUNCTION create_video_room(
  p_room_type TEXT DEFAULT 'peer_to_peer',
  p_participant_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS TABLE (
  room_id TEXT,
  room_data JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id TEXT;
  v_room_uuid UUID;
  v_user_profile JSONB;
BEGIN
  -- Generate unique room ID
  v_room_id := 'room_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || substr(gen_random_uuid()::TEXT, 1, 8);
  
  -- Insert room
  INSERT INTO video_rooms (room_id, host_user_id, participant_user_id, room_type, metadata)
  VALUES (v_room_id, auth.uid(), p_participant_user_id, p_room_type, p_metadata)
  RETURNING id INTO v_room_uuid;
  
  -- Add host as participant
  INSERT INTO video_room_participants (room_id, user_id, is_host)
  VALUES (v_room_id, auth.uid(), TRUE);
  
  -- Get user profile for return data
  SELECT to_jsonb(p.*) INTO v_user_profile
  FROM profiles p
  WHERE p.id = auth.uid();
  
  RETURN QUERY
  SELECT 
    v_room_id::TEXT,
    jsonb_build_object(
      'room_id', v_room_id,
      'room_type', p_room_type,
      'host', v_user_profile,
      'created_at', NOW(),
      'status', 'waiting'
    );
END;
$$;

CREATE OR REPLACE FUNCTION join_video_room(
  p_room_id TEXT,
  p_peer_id TEXT DEFAULT NULL
) RETURNS TABLE (
  success BOOLEAN,
  room_data JSONB,
  participants JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_exists BOOLEAN;
  v_room_data JSONB;
  v_participants JSONB;
BEGIN
  -- Check if room exists and is active
  SELECT EXISTS(
    SELECT 1 FROM video_rooms 
    WHERE room_id = p_room_id AND status IN ('waiting', 'active')
  ) INTO v_room_exists;
  
  IF NOT v_room_exists THEN
    RETURN QUERY
    SELECT FALSE, NULL::JSONB, NULL::JSONB;
    RETURN;
  END IF;
  
  -- Insert or update participant
  INSERT INTO video_room_participants (room_id, user_id, peer_id)
  VALUES (p_room_id, auth.uid(), p_peer_id)
  ON CONFLICT (room_id, user_id) 
  DO UPDATE SET 
    peer_id = EXCLUDED.peer_id,
    joined_at = NOW(),
    left_at = NULL,
    connection_status = 'connecting';
  
  -- Update room status to active if it was waiting
  UPDATE video_rooms 
  SET status = 'active', started_at = COALESCE(started_at, NOW())
  WHERE room_id = p_room_id AND status = 'waiting';
  
  -- Get room data
  SELECT to_jsonb(r.*) INTO v_room_data
  FROM video_rooms r
  WHERE r.room_id = p_room_id;
  
  -- Get participants
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', vp.user_id,
      'peer_id', vp.peer_id,
      'is_host', vp.is_host,
      'connection_status', vp.connection_status,
      'profile', p.*
    )
  ) INTO v_participants
  FROM video_room_participants vp
  JOIN profiles p ON p.id = vp.user_id
  WHERE vp.room_id = p_room_id AND vp.left_at IS NULL;
  
  RETURN QUERY
  SELECT TRUE, v_room_data, v_participants;
END;
$$;

-- Function to send WebRTC signals
CREATE OR REPLACE FUNCTION send_webrtc_signal(
  p_room_id TEXT,
  p_to_user_id UUID,
  p_signal_type TEXT,
  p_signal_data JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO video_room_signals (room_id, from_user_id, to_user_id, signal_type, signal_data)
  VALUES (p_room_id, auth.uid(), p_to_user_id, p_signal_type, p_signal_data);
  
  RETURN TRUE;
END;
$$;

-- Function to leave room
CREATE OR REPLACE FUNCTION leave_video_room(
  p_room_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_host BOOLEAN;
  v_participant_count INTEGER;
BEGIN
  -- Update participant as left
  UPDATE video_room_participants 
  SET left_at = NOW(), connection_status = 'disconnected'
  WHERE room_id = p_room_id AND user_id = auth.uid()
  RETURNING is_host INTO v_is_host;
  
  -- Count remaining active participants
  SELECT COUNT(*) INTO v_participant_count
  FROM video_room_participants
  WHERE room_id = p_room_id AND left_at IS NULL;
  
  -- If no participants left or host left, end the room
  IF v_participant_count = 0 OR v_is_host THEN
    UPDATE video_rooms 
    SET status = 'ended', ended_at = NOW()
    WHERE room_id = p_room_id;
    
    -- Mark all participants as left
    UPDATE video_room_participants
    SET left_at = COALESCE(left_at, NOW()), connection_status = 'disconnected'
    WHERE room_id = p_room_id AND left_at IS NULL;
  END IF;
  
  RETURN TRUE;
END;
$$;
