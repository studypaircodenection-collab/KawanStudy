-- 003_gamification_data.sql
-- Initial data for achievements and daily challenges

-- Insert initial achievements
insert into public.achievements (name, title, description, icon, points_required, condition_type, condition_value, rarity) values
-- Points-based achievements
('rookie', 'Rookie', 'Earn your first 100 points', '🌟', 100, 'points_threshold', 100, 'common'),
('rising_star', 'Rising Star', 'Reach 500 points', '⭐', 500, 'points_threshold', 500, 'common'),
('scholar', 'Scholar', 'Accumulate 1,000 points', '📚', 1000, 'points_threshold', 1000, 'rare'),
('expert', 'Expert', 'Achieve 2,500 points', '🎓', 2500, 'points_threshold', 2500, 'rare'),
('master', 'Master', 'Reach 5,000 points', '👑', 5000, 'points_threshold', 5000, 'epic'),
('legend', 'Legend', 'Accumulate 10,000 points', '🏆', 10000, 'points_threshold', 10000, 'epic'),
('tryhard', 'Tryhard', 'Reach the ultimate 25,000 points', '💎', 25000, 'points_threshold', 25000, 'legendary'),

-- Streak-based achievements
('consistent', 'Consistent', 'Maintain a 3-day streak', '🔥', null, 'streak_length', 3, 'common'),
('dedicated', 'Dedicated', 'Achieve a 7-day streak', '💪', null, 'streak_length', 7, 'rare'),
('committed', 'Committed', 'Reach a 14-day streak', '⚡', null, 'streak_length', 14, 'epic'),
('unstoppable', 'Unstoppable', 'Maintain a 30-day streak', '🚀', null, 'streak_length', 30, 'legendary'),

-- Activity-based achievements
('tutor_helper', 'Tutor Helper', 'Complete 5 tutoring sessions', '👨‍🏫', null, 'activity_count', 5, 'common'),
('class_joiner', 'Class Joiner', 'Join 10 study classes', '👥', null, 'activity_count', 10, 'common'),
('quiz_master', 'Quiz Master', 'Complete 20 quizzes', '🧠', null, 'activity_count', 20, 'rare'),
('study_addict', 'Study Addict', 'Join 50 study sessions', '📖', null, 'activity_count', 50, 'epic');

-- Insert daily challenges
insert into public.daily_challenges (name, description, challenge_type, target_value, points_reward, difficulty) values
-- Easy challenges (10-20 points)
('daily_login', 'Log in to StudyPair', 'profile_update', 1, 10, 'easy'),
('complete_quiz', 'Complete at least 1 quiz', 'quiz', 1, 20, 'easy'),
('join_class', 'Join a study class', 'class_join', 1, 15, 'easy'),
('update_profile', 'Update your profile information', 'profile_update', 1, 10, 'easy'),

-- Medium challenges (25-40 points)
('study_session', 'Complete a 30-minute study session', 'study_session', 1, 30, 'medium'),
('help_others', 'Tutor another student', 'tutor_session', 1, 40, 'medium'),
('quiz_streak', 'Complete 3 quizzes in a row', 'quiz', 3, 35, 'medium'),
('class_participation', 'Join 2 different study classes', 'class_join', 2, 25, 'medium'),

-- Hard challenges (50-100 points)
('study_marathon', 'Complete 2 hours of study sessions', 'study_session', 120, 80, 'hard'), -- 120 minutes
('tutor_expert', 'Help 3 different students', 'tutor_session', 3, 100, 'hard'),
('quiz_champion', 'Complete 5 quizzes with high scores', 'quiz', 5, 75, 'hard'),
('social_butterfly', 'Join 5 different study groups', 'class_join', 5, 60, 'hard');

-- Function to reset daily challenges (to be called daily via cron job)
create or replace function public.reset_daily_challenges()
returns void as $$
begin
  -- Mark all incomplete challenges from previous days as expired
  update public.user_daily_progress
  set is_completed = false
  where progress_date < current_date
  and is_completed = false;
  
  -- No need to create new records - they're created on-demand when users attempt challenges
end;
$$ language plpgsql security definer;

-- Function to get user's daily challenge progress
create or replace function public.get_user_daily_challenges(p_user_id uuid)
returns table(
  challenge_id uuid,
  challenge_name text,
  challenge_description text,
  challenge_type text,
  target_value integer,
  points_reward integer,
  difficulty text,
  current_progress integer,
  is_completed boolean,
  progress_percentage numeric
) as $$
begin
  return query
  select 
    dc.id as challenge_id,
    dc.name as challenge_name,
    dc.description as challenge_description,
    dc.challenge_type,
    dc.target_value,
    dc.points_reward,
    dc.difficulty,
    coalesce(udp.current_progress, 0) as current_progress,
    coalesce(udp.is_completed, false) as is_completed,
    case 
      when dc.target_value > 0 then 
        round((coalesce(udp.current_progress, 0)::numeric / dc.target_value) * 100, 1)
      else 0
    end as progress_percentage
  from public.daily_challenges dc
  left join public.user_daily_progress udp on (
    udp.challenge_id = dc.id 
    and udp.user_id = p_user_id 
    and udp.progress_date = current_date
  )
  where dc.is_active = true
  order by dc.difficulty, dc.points_reward desc;
end;
$$ language plpgsql security definer;

-- Function to get leaderboard with additional stats
create or replace function public.get_leaderboard(p_limit integer default 10)
returns table(
  rank bigint,
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  university text,
  total_points integer,
  level integer,
  current_streak integer,
  longest_streak integer,
  achievement_count bigint
) as $$
begin
  return query
  select 
    l.rank,
    l.id as user_id,
    l.username,
    l.full_name,
    l.avatar_url,
    l.university,
    l.total_points,
    l.level,
    l.current_streak,
    l.longest_streak,
    coalesce(ua_count.achievement_count, 0) as achievement_count
  from public.leaderboard l
  left join (
    select 
      ua.user_id, 
      count(*) as achievement_count
    from public.user_achievements ua
    group by ua.user_id
  ) ua_count on ua_count.user_id = l.id
  order by l.rank
  limit p_limit;
end;
$$ language plpgsql security definer;

-- Function to get user achievements with details
create or replace function public.get_user_achievements(p_user_id uuid)
returns table(
  achievement_id uuid,
  achievement_name text,
  achievement_title text,
  achievement_description text,
  achievement_icon text,
  rarity text,
  earned_at timestamp with time zone
) as $$
begin
  return query
  select 
    a.id as achievement_id,
    a.name as achievement_name,
    a.title as achievement_title,
    a.description as achievement_description,
    a.icon as achievement_icon,
    a.rarity,
    ua.earned_at
  from public.user_achievements ua
  join public.achievements a on a.id = ua.achievement_id
  where ua.user_id = p_user_id
  order by ua.earned_at desc;
end;
$$ language plpgsql security definer;

-- Function to get user's recent point transactions
create or replace function public.get_user_point_history(p_user_id uuid, p_limit integer default 20)
returns table(
  transaction_id uuid,
  points integer,
  transaction_type text,
  source text,
  description text,
  created_at timestamp with time zone
) as $$
begin
  return query
  select 
    pt.id as transaction_id,
    pt.points,
    pt.transaction_type,
    pt.source,
    pt.description,
    pt.created_at
  from public.point_transactions pt
  where pt.user_id = p_user_id
  order by pt.created_at desc
  limit p_limit;
end;
$$ language plpgsql security definer;
