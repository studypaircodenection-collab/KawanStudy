-- Fix notification deletion issues
-- Add missing RLS DELETE policy and improved RPC functions

-- Add DELETE policy for notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Create improved RPC function for deleting a single notification
CREATE OR REPLACE FUNCTION public.delete_user_notification(
  p_notification_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  delete_count integer;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to delete notifications';
  END IF;
  
  -- Delete the notification if it belongs to the user
  DELETE FROM public.notifications 
  WHERE id = p_notification_id 
    AND user_id = current_user_id;
  
  GET DIAGNOSTICS delete_count = ROW_COUNT;
  
  -- Return true if deletion was successful
  RETURN delete_count > 0;
END;
$$;

-- Create improved RPC function for clearing all user notifications
CREATE OR REPLACE FUNCTION public.clear_all_user_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  delete_count integer;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to delete notifications';
  END IF;
  
  -- Delete all notifications for the user
  DELETE FROM public.notifications 
  WHERE user_id = current_user_id;
  
  GET DIAGNOSTICS delete_count = ROW_COUNT;
  
  -- Return number of deleted notifications
  RETURN delete_count;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_notification(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_all_user_notifications() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.delete_user_notification(uuid) IS 'Delete a specific notification for the authenticated user';
COMMENT ON FUNCTION public.clear_all_user_notifications() IS 'Clear all notifications for the authenticated user';

-- Add logging table for debugging notification operations (optional)
CREATE TABLE IF NOT EXISTS public.notification_audit_log (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  operation text NOT NULL, -- 'delete', 'clear_all', etc.
  notification_id uuid,
  success boolean NOT NULL,
  error_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for audit log
ALTER TABLE public.notification_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON public.notification_audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Function to log notification operations
CREATE OR REPLACE FUNCTION public.log_notification_operation(
  p_operation text,
  p_notification_id uuid DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.notification_audit_log (
      user_id, operation, notification_id, success, error_message
    ) VALUES (
      current_user_id, p_operation, p_notification_id, p_success, p_error_message
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_notification_operation(text, uuid, boolean, text) TO authenticated;
