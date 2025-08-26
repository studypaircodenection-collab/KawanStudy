-- Migration: Add get_user_stats function
-- Description: Function to get comprehensive user statistics including rank and activity data

-- Drop and recreate leaderboard view to avoid column conflicts
drop view if exists public.leaderboard;

create view public.leaderboard as
select
  id,
  username,
  full_name,
  total_points,
  level,
  row_number() over (order by total_points desc) as rank
from public.profiles
order by total_points desc;-- Function to get comprehensive user stats
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

-- Grant execute permission to authenticated users
grant execute on function public.get_user_stats(uuid) to authenticated;
