-- Fix infinite recursion by completely resetting RLS policies
-- This migration completely removes all existing policies and creates simple ones

-- First, disable RLS to stop any current recursion
ALTER TABLE video_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_room_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_room_signals DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies using dynamic SQL to handle any policy name
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on video_rooms
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'video_rooms' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON video_rooms CASCADE';
    END LOOP;
    
    -- Drop all policies on video_room_participants  
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'video_room_participants' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON video_room_participants CASCADE';
    END LOOP;
    
    -- Drop all policies on video_room_signals
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'video_room_signals' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON video_room_signals CASCADE';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_room_participants ENABLE ROW LEVEL SECURITY; 
ALTER TABLE video_room_signals ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- video_rooms policies: No cross-table references
CREATE POLICY "video_rooms_authenticated_select" ON video_rooms 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "video_rooms_host_insert" ON video_rooms 
  FOR INSERT WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "video_rooms_host_update" ON video_rooms 
  FOR UPDATE USING (auth.uid() = host_user_id);

CREATE POLICY "video_rooms_host_delete" ON video_rooms 
  FOR DELETE USING (auth.uid() = host_user_id);

-- video_room_participants policies: No cross-table references
CREATE POLICY "participants_authenticated_select" ON video_room_participants 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "participants_user_insert" ON video_room_participants 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "participants_user_update" ON video_room_participants 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "participants_user_delete" ON video_room_participants 
  FOR DELETE USING (auth.uid() = user_id);

-- video_room_signals policies: No cross-table references  
CREATE POLICY "signals_sender_receiver_select" ON video_room_signals 
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "signals_sender_insert" ON video_room_signals 
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "signals_sender_update" ON video_room_signals 
  FOR UPDATE USING (auth.uid() = from_user_id);

CREATE POLICY "signals_sender_delete" ON video_room_signals 
  FOR DELETE USING (auth.uid() = from_user_id);
