-- Migration: Add achievement progress and gamification stats functions
-- Description: Functions to get achievements with user progress and comprehensive gamification stats

-- Function to get all achievements with user progress
create or replace function public.get_achievements_with_progress(
  p_user_id uuid
)
returns table (
  id uuid,
  title text,
  description text,
  icon text,
  category text,
  points integer,
  requirement_value integer,
  requirement_type text,
  is_earned boolean,
  earned_at timestamp with time zone,
  progress integer
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    a.id,
    a.title,
    a.description,
    coalesce(a.icon, '🏆') as icon,
    coalesce(a.rarity, 'common') as category,
    coalesce(a.points_required, 0) as points,
    coalesce(a.condition_value, 1) as requirement_value,
    a.condition_type as requirement_type,
    case when ua.user_id is not null then true else false end as is_earned,
    ua.earned_at,
    -- Calculate progress based on condition type - simplified to only points
    case 
      when a.condition_type = 'points_threshold' then 
        least(coalesce((select p.total_points from profiles p where p.id = p_user_id), 0), coalesce(a.condition_value, 1))
      else 0
    end as progress
  from achievements a
  left join user_achievements ua on a.id = ua.achievement_id and ua.user_id = p_user_id
  where a.is_active = true
  order by 
    case when ua.user_id is not null then 0 else 1 end, -- earned achievements first
    a.rarity,
    a.points_required desc;
end;
$$;

-- Function to get comprehensive user gamification stats
create or replace function public.get_user_gamification_stats(
  p_user_id uuid
)
returns table (
  total_points integer,
  level integer,
  experience_points integer,
  achievements_count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    coalesce(p.total_points, 0) as total_points,
    coalesce(p.level, 1) as level,
    coalesce(p.experience_points, 0) as experience_points,
    coalesce((
      select count(*) 
      from user_achievements ua
      where ua.user_id = p_user_id
    ), 0) as achievements_count
  from profiles p
  where p.id = p_user_id;
end;
$$;

-- Grant execute permissions
grant execute on function public.get_achievements_with_progress(uuid) to authenticated;
grant execute on function public.get_user_gamification_stats(uuid) to authenticated;
