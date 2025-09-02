-- Fix RLS policies to avoid circular references
-- This migration fixes the infinite recursion issue

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view rooms they participate in" ON video_rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON video_rooms;
DROP POLICY IF EXISTS "Hosts can update their rooms" ON video_rooms;
DROP POLICY IF EXISTS "Users can view rooms they created or joined" ON video_rooms;

DROP POLICY IF EXISTS "Users can view participants in their rooms" ON video_room_participants;
DROP POLICY IF EXISTS "Users can join rooms" ON video_room_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON video_room_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON video_room_participants;
DROP POLICY IF EXISTS "Users can view participants in rooms they created" ON video_room_participants;

DROP POLICY IF EXISTS "Users can view signals in their rooms" ON video_room_signals;
DROP POLICY IF EXISTS "Users can create signals in their rooms" ON video_room_signals;
DROP POLICY IF EXISTS "Users can view their own signals" ON video_room_signals;
DROP POLICY IF EXISTS "Users can create signals" ON video_room_signals;

-- Create new, simple RLS policies without circular references

-- video_rooms policies 
CREATE POLICY "room_select_policy" ON video_rooms
  FOR SELECT USING (
    host_user_id = auth.uid() OR 
    participant_user_id = auth.uid()
  );

CREATE POLICY "room_insert_policy" ON video_rooms
  FOR INSERT WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "room_update_policy" ON video_rooms
  FOR UPDATE USING (host_user_id = auth.uid());

-- video_room_participants policies
CREATE POLICY "participants_select_policy" ON video_room_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "participants_insert_policy" ON video_room_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "participants_update_policy" ON video_room_participants
  FOR UPDATE USING (user_id = auth.uid());

-- video_room_signals policies
CREATE POLICY "signals_select_policy" ON video_room_signals
  FOR SELECT USING (
    from_user_id = auth.uid() OR 
    to_user_id = auth.uid() OR 
    to_user_id IS NULL
  );

CREATE POLICY "signals_insert_policy" ON video_room_signals
  FOR INSERT WITH CHECK (from_user_id = auth.uid());
