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
    -- Calculate progress based on condition type
    case 
      when a.condition_type = 'points_threshold' then 
        least(coalesce((select p.total_points from profiles p where p.id = p_user_id), 0), coalesce(a.condition_value, 1))
      when a.condition_type = 'streak_length' then 
        least(coalesce((select p.current_streak from profiles p where p.id = p_user_id), 0), coalesce(a.condition_value, 1))
      when a.condition_type = 'activity_count' then 
        least(
          coalesce((
            select count(*)::integer 
            from point_transactions pt
            where pt.user_id = p_user_id 
            and pt.source = 'study_session'
          ), 0), 
          coalesce(a.condition_value, 1)
        )
      when a.condition_type = 'special' then 
        -- For special achievements, we'll handle them case by case
        case 
          when a.name like '%connection%' or a.name like '%friend%' then
            least(
              coalesce((
                select count(*)::integer 
                from peer_connections pc
                where (pc.requester_id = p_user_id or pc.addressee_id = p_user_id) 
                and pc.status = 'accepted'
              ), 0), 
              coalesce(a.condition_value, 1)
            )
          else 0
        end
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
  current_streak integer,
  longest_streak integer,
  total_study_sessions bigint,
  total_tutoring_hours bigint,
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
    coalesce(p.current_streak, 0) as current_streak,
    coalesce(p.longest_streak, 0) as longest_streak,
    coalesce((
      select count(*) 
      from point_transactions pt
      where pt.user_id = p_user_id 
      and pt.source = 'study_session'
    ), 0) as total_study_sessions,
    coalesce((
      select count(*) 
      from point_transactions pt
      where pt.user_id = p_user_id 
      and pt.source = 'tutor_session'
    ), 0) as total_tutoring_hours,
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
