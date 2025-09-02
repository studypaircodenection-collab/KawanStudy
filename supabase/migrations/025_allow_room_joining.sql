-- Update RLS policies to allow users to join rooms created by others
-- This allows room sharing and multi-user functionality

-- Update video_room_participants policies to allow joining any active room
DROP POLICY IF EXISTS "participants_select_policy" ON video_room_participants;
CREATE POLICY "participants_select_policy" ON video_room_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    room_id IN (
      SELECT room_id FROM video_rooms 
      WHERE status IN ('waiting', 'active')
    )
  );

-- Update video_rooms policy to allow viewing active rooms
DROP POLICY IF EXISTS "room_select_policy" ON video_rooms;
CREATE POLICY "room_select_policy" ON video_rooms
  FOR SELECT USING (
    host_user_id = auth.uid() OR 
    participant_user_id = auth.uid() OR
    status IN ('waiting', 'active')
  );

-- Allow users to see participants in active rooms they want to join
CREATE POLICY "participants_view_active_rooms" ON video_room_participants
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM video_rooms 
      WHERE status IN ('waiting', 'active')
    )
  );
