-- 027_populate_daily_challenges.sql
-- Add comprehensive daily challenges for the gamification system

-- First, clear existing daily challenges to avoid conflicts
DELETE FROM public.daily_challenges;

-- Insert comprehensive daily challenges
INSERT INTO public.daily_challenges (name, description, challenge_type, target_value, points_reward, difficulty, is_active) VALUES

-- Easy challenges (10-25 points)
('daily_login', 'Log in to StudyPair today', 'profile_update', 1, 10, 'easy', true),
('profile_update', 'Update your profile information', 'profile_update', 1, 15, 'easy', true),
('browse_notes', 'Browse and view 3 study materials', 'profile_update', 3, 20, 'easy', true),
('complete_quiz', 'Complete at least 1 quiz', 'quiz', 1, 25, 'easy', true),
('join_chat', 'Send a message in any chat room', 'profile_update', 1, 15, 'easy', true),

-- Medium challenges (30-50 points)
('study_session', 'Study for 30 minutes using platform materials', 'profile_update', 30, 40, 'medium', true),
('quiz_streak', 'Complete 3 quizzes in a row', 'quiz', 3, 45, 'medium', true),
('peer_connect', 'Connect with 2 new study partners', 'profile_update', 2, 35, 'medium', true),
('note_sharing', 'Upload and share 2 study notes', 'profile_update', 2, 40, 'medium', true),
('video_session', 'Join or start a video study session', 'profile_update', 1, 50, 'medium', true),

-- Hard challenges (60-100 points)
('quiz_master', 'Complete 5 quizzes with 80%+ scores', 'quiz', 5, 75, 'hard', true),
('tutor_helper', 'Help 3 different students with questions', 'profile_update', 3, 80, 'hard', true),
('study_marathon', 'Study for 2 hours continuously', 'profile_update', 120, 100, 'hard', true),
('social_learner', 'Like and comment on 10 study materials', 'profile_update', 10, 60, 'hard', true),
('knowledge_sharer', 'Create and publish 3 high-quality notes', 'profile_update', 3, 90, 'hard', true);

-- Function to automatically award daily login points
CREATE OR REPLACE FUNCTION public.award_daily_login(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  login_challenge_id uuid;
BEGIN
  -- Get the daily login challenge ID
  SELECT id INTO login_challenge_id 
  FROM public.daily_challenges 
  WHERE name = 'daily_login' AND is_active = true
  LIMIT 1;
  
  IF login_challenge_id IS NOT NULL THEN
    -- Complete the daily login challenge
    RETURN public.complete_daily_challenge(p_user_id, login_challenge_id);
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award challenge progress for various activities
CREATE OR REPLACE FUNCTION public.award_challenge_progress(
  p_user_id uuid,
  p_activity_type text,
  p_progress_amount integer DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
  challenge_rec record;
  progress_updated boolean DEFAULT false;
BEGIN
  -- Map activity types to challenge types (only quiz and profile_update are allowed)
  CASE p_activity_type
    WHEN 'quiz_completed', 'quiz' THEN
      -- Find quiz challenges
      FOR challenge_rec IN 
        SELECT id, name, challenge_type, target_value, points_reward
        FROM public.daily_challenges 
        WHERE challenge_type = 'quiz' AND is_active = true
      LOOP
        IF public.update_challenge_progress(p_user_id, challenge_rec.id, p_progress_amount) THEN
          progress_updated := true;
        END IF;
      END LOOP;
    ELSE
      -- Map all other activities to profile_update challenges
      FOR challenge_rec IN 
        SELECT id, name, challenge_type, target_value, points_reward
        FROM public.daily_challenges 
        WHERE challenge_type = 'profile_update' AND is_active = true
      LOOP
        IF public.update_challenge_progress(p_user_id, challenge_rec.id, p_progress_amount) THEN
          progress_updated := true;
        END IF;
      END LOOP;
  END CASE;
  
  RETURN progress_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update challenge progress (more granular than complete)
CREATE OR REPLACE FUNCTION public.update_challenge_progress(
  p_user_id uuid,
  p_challenge_id uuid,
  p_progress_amount integer DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
  challenge_record record;
  progress_record record;
  new_progress integer;
  challenge_completed boolean DEFAULT false;
BEGIN
  -- Get challenge info
  SELECT * INTO challenge_record 
  FROM public.daily_challenges 
  WHERE id = p_challenge_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Get or create progress record
  INSERT INTO public.user_daily_progress (user_id, challenge_id, progress_date, current_progress)
  VALUES (p_user_id, p_challenge_id, current_date, 0)
  ON CONFLICT (user_id, challenge_id, progress_date) 
  DO NOTHING;
  
  -- Get current progress
  SELECT * INTO progress_record
  FROM public.user_daily_progress
  WHERE user_id = p_user_id 
  AND challenge_id = p_challenge_id 
  AND progress_date = current_date;
  
  -- Check if already completed
  IF progress_record.is_completed THEN
    RETURN false;
  END IF;
  
  -- Calculate new progress
  new_progress := progress_record.current_progress + p_progress_amount;
  
  -- Don't exceed target
  IF new_progress > challenge_record.target_value THEN
    new_progress := challenge_record.target_value;
  END IF;
  
  -- Check if challenge will be completed
  IF new_progress >= challenge_record.target_value THEN
    challenge_completed := true;
  END IF;
  
  -- Update progress
  UPDATE public.user_daily_progress
  SET 
    current_progress = new_progress,
    is_completed = challenge_completed,
    completed_at = CASE WHEN challenge_completed THEN now() ELSE null END
  WHERE id = progress_record.id;
  
  -- Award points if completed
  IF challenge_completed THEN
    PERFORM public.add_points_to_user(
      p_user_id,
      challenge_record.points_reward,
      'daily_challenge',
      p_challenge_id,
      'Daily Challenge: ' || challenge_record.name
    );
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the log_user_activity function to trigger challenge progress
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_activity_data jsonb default '{}',
  p_points_earned integer default 0
)
RETURNS void AS $$
BEGIN
  -- Insert activity log
  INSERT INTO public.activity_log (user_id, activity_type, activity_data, points_earned)
  VALUES (p_user_id, p_activity_type, p_activity_data, p_points_earned);
  
  -- Add points if any
  IF p_points_earned > 0 THEN
    PERFORM public.add_points_to_user(
      p_user_id, 
      p_points_earned, 
      p_activity_type, 
      null, 
      'Activity: ' || p_activity_type
    );
  END IF;
  
  -- Award challenge progress based on activity
  PERFORM public.award_challenge_progress(p_user_id, p_activity_type, 1);
  
  -- Also award daily login if this is any activity (user is active)
  PERFORM public.award_daily_login(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
