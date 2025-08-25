-- master_schema.sql
-- Master schema file that includes all migrations
-- Run this file to set up the complete database schema

-- Run all migrations in order
\i 001_profiles.sql
\i 002_gamification.sql
\i 003_gamification_data.sql
\i 004_user_data.sql
\i 005_messaging_system.sql

-- Additional utility functions for the complete system

-- Function to get comprehensive user stats
create or replace function public.get_user_stats(p_user_id uuid)
returns json as $$
declare
  user_stats json;
begin
  select json_build_object(
    'profile', (
      select json_build_object(
        'id', id,
        'username', username,
        'full_name', full_name,
        'avatar_url', avatar_url,
        'total_points', total_points,
        'level', level,
        'experience_points', experience_points,
        'current_streak', current_streak,
        'longest_streak', longest_streak,
        'created_at', created_at
      )
      from public.profiles
      where id = p_user_id
    ),
    'rank', (
      select rank
      from public.leaderboard
      where id = p_user_id
    ),
    'achievements_count', (
      select count(*)
      from public.user_achievements
      where user_id = p_user_id
    ),
    'recent_transactions', (
      select json_agg(
        json_build_object(
          'points', points,
          'source', source,
          'description', description,
          'created_at', created_at
        )
      )
      from (
        select * from public.point_transactions
        where user_id = p_user_id
        order by created_at desc
        limit 5
      ) recent
    ),
    'daily_challenges_completed_today', (
      select count(*)
      from public.user_daily_progress
      where user_id = p_user_id
      and progress_date = current_date
      and is_completed = true
    )
  ) into user_stats;
  
  return user_stats;
end;
$$ language plpgsql security definer;

-- Function to simulate various activities for testing
create or replace function public.simulate_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_count integer default 1
)
returns text as $$
declare
  i integer;
  points_per_activity integer;
  result_message text;
begin
  -- Determine points based on activity type
  case p_activity_type
    when 'tutor_session' then points_per_activity := 50;
    when 'class_join' then points_per_activity := 25;
    when 'quiz' then points_per_activity := 15;
    when 'study_session' then points_per_activity := 10;
    else points_per_activity := 5;
  end case;
  
  -- Simulate activities
  for i in 1..p_count loop
    perform public.log_user_activity(
      p_user_id,
      p_activity_type,
      json_build_object('simulation', true, 'iteration', i),
      points_per_activity
    );
  end loop;
  
  result_message := format('Simulated %s %s activities, earned %s points total',
    p_count, p_activity_type, p_count * points_per_activity);
  
  return result_message;
end;
$$ language plpgsql security definer;
