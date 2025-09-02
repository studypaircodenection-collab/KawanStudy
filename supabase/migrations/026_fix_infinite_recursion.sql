-- Completely disable RLS on all tables to stop recursion
ALTER TABLE video_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_room_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_room_signals DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to be safe
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on video_rooms
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'video_rooms'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON video_rooms';
    END LOOP;
    
    -- Drop all policies on video_room_participants  
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'video_room_participants'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON video_room_participants';
    END LOOP;
    
    -- Drop all policies on video_room_signals
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'video_room_signals'  
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON video_room_signals';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_room_participants ENABLE ROW LEVEL SECURITY; 
ALTER TABLE video_room_signals ENABLE ROW LEVEL SECURITY;

-- Create ULTRA SIMPLE policies with NO cross-table references
-- For video_rooms: allow authenticated users to see all rooms, only hosts can modify their own
CREATE POLICY "rooms_select_all" ON video_rooms FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rooms_insert_own" ON video_rooms FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "rooms_update_own" ON video_rooms FOR UPDATE USING (auth.uid() = host_user_id);
CREATE POLICY "rooms_delete_own" ON video_rooms FOR DELETE USING (auth.uid() = host_user_id);

-- For video_room_participants: allow all authenticated users to see participants, only manage their own records
CREATE POLICY "participants_select_all" ON video_room_participants FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "participants_insert_own" ON video_room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "participants_update_own" ON video_room_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "participants_delete_own" ON video_room_participants FOR DELETE USING (auth.uid() = user_id);

-- For video_room_signals: allow users to manage their own signals only
CREATE POLICY "signals_select_own" ON video_room_signals FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "signals_insert_own" ON video_room_signals FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "signals_update_own" ON video_room_signals FOR UPDATE USING (auth.uid() = from_user_id);
CREATE POLICY "signals_delete_own" ON video_room_signals FOR DELETE USING (auth.uid() = from_user_id);
