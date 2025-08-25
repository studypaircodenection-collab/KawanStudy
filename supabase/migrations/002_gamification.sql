-- 002_gamification.sql
-- Gamification system tables and functions

-- Create point transactions table to track all point movements
create table public.point_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  points integer not null,
  transaction_type text not null check (transaction_type in ('earned', 'spent', 'bonus', 'penalty')),
  source text not null, -- 'tutor_session', 'class_join', 'daily_challenge', 'achievement', etc.
  source_id uuid, -- reference to the specific activity
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create achievements/badges table
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  title text not null, -- Display title like "Tryhard"
  description text not null,
  icon text, -- icon identifier or URL
  points_required integer,
  condition_type text not null check (condition_type in ('points_threshold', 'streak_length', 'activity_count', 'special')),
  condition_value integer,
  condition_meta jsonb, -- additional condition parameters
  is_active boolean default true,
  rarity text default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user achievements junction table
create table public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  achievement_id uuid references public.achievements on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, achievement_id)
);

-- Create daily challenges table
create table public.daily_challenges (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  challenge_type text not null check (challenge_type in ('quiz', 'study_session', 'tutor_session', 'class_join', 'profile_update')),
  target_value integer default 1, -- how many times to complete
  points_reward integer not null,
  is_active boolean default true,
  difficulty text default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user daily challenge progress table
create table public.user_daily_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  challenge_id uuid references public.daily_challenges on delete cascade not null,
  progress_date date not null default current_date,
  current_progress integer default 0,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  unique(user_id, challenge_id, progress_date)
);

-- Create activity log table for tracking user activities
create table public.activity_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  activity_type text not null, -- 'tutor_session', 'class_join', 'quiz_complete', etc.
  activity_data jsonb, -- flexible data storage for activity details
  points_earned integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create leaderboard view for easy querying
create view public.leaderboard as
select 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.university,
  p.total_points,
  p.level,
  p.current_streak,
  p.longest_streak,
  row_number() over (order by p.total_points desc, p.level desc, p.longest_streak desc) as rank
from public.profiles p
where p.total_points > 0
order by p.total_points desc, p.level desc, p.longest_streak desc;

-- Create indexes for performance
create index idx_point_transactions_user_id on public.point_transactions(user_id);
create index idx_point_transactions_created_at on public.point_transactions(created_at desc);
create index idx_point_transactions_source on public.point_transactions(source);

create index idx_user_achievements_user_id on public.user_achievements(user_id);
create index idx_user_achievements_earned_at on public.user_achievements(earned_at desc);

create index idx_user_daily_progress_user_date on public.user_daily_progress(user_id, progress_date);
create index idx_user_daily_progress_date on public.user_daily_progress(progress_date);

create index idx_activity_log_user_id on public.activity_log(user_id);
create index idx_activity_log_created_at on public.activity_log(created_at desc);
create index idx_activity_log_activity_type on public.activity_log(activity_type);

-- Enable RLS on all tables
alter table public.point_transactions enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.user_daily_progress enable row level security;
alter table public.activity_log enable row level security;

-- RLS Policies for point_transactions
create policy "Users can view own point transactions"
  on public.point_transactions for select
  using (auth.uid() = user_id);

-- RLS Policies for achievements (public read)
create policy "Everyone can view achievements"
  on public.achievements for select
  using (true);

-- RLS Policies for user_achievements
create policy "Users can view own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "Users can view others' achievements"
  on public.user_achievements for select
  using (true); -- Public for leaderboard/profile views

-- RLS Policies for daily_challenges (public read)
create policy "Everyone can view daily challenges"
  on public.daily_challenges for select
  using (is_active = true);

-- RLS Policies for user_daily_progress
create policy "Users can view own daily progress"
  on public.user_daily_progress for select
  using (auth.uid() = user_id);

create policy "Users can update own daily progress"
  on public.user_daily_progress for update
  using (auth.uid() = user_id);

create policy "Users can insert own daily progress"
  on public.user_daily_progress for insert
  with check (auth.uid() = user_id);

-- RLS Policies for activity_log
create policy "Users can view own activity log"
  on public.activity_log for select
  using (auth.uid() = user_id);

-- Function to calculate level from experience points
create or replace function public.calculate_level(experience_points integer)
returns integer as $$
begin
  -- Level formula: level = floor(sqrt(experience_points / 100)) + 1
  -- This means: Level 1 = 0-99 XP, Level 2 = 100-399 XP, Level 3 = 400-899 XP, etc.
  return floor(sqrt(experience_points::numeric / 100)) + 1;
end;
$$ language plpgsql immutable;

-- Function to add points to user and create transaction record
create or replace function public.add_points_to_user(
  p_user_id uuid,
  p_points integer,
  p_source text,
  p_source_id uuid default null,
  p_description text default null
)
returns void as $$
declare
  current_points integer;
  new_total_points integer;
  new_experience_points integer;
  new_level integer;
begin
  -- Get current points and experience
  select total_points, experience_points 
  into current_points, new_experience_points
  from public.profiles 
  where id = p_user_id;
  
  -- Calculate new totals
  new_total_points := current_points + p_points;
  new_experience_points := new_experience_points + p_points;
  new_level := public.calculate_level(new_experience_points);
  
  -- Update user profile
  update public.profiles 
  set 
    total_points = new_total_points,
    experience_points = new_experience_points,
    level = new_level,
    updated_at = now()
  where id = p_user_id;
  
  -- Create transaction record
  insert into public.point_transactions (
    user_id, points, transaction_type, source, source_id, description
  ) values (
    p_user_id, p_points, 'earned', p_source, p_source_id, p_description
  );
  
  -- Check for new achievements
  perform public.check_and_award_achievements(p_user_id);
end;
$$ language plpgsql security definer;

-- Function to update user streak
create or replace function public.update_user_streak(p_user_id uuid)
returns void as $$
declare
  last_activity date;
  current_streak_val integer;
  longest_streak_val integer;
begin
  -- Get current streak info
  select last_activity_date, current_streak, longest_streak
  into last_activity, current_streak_val, longest_streak_val
  from public.profiles
  where id = p_user_id;
  
  -- Check if activity is consecutive
  if last_activity = current_date - interval '1 day' then
    -- Consecutive day, increment streak
    current_streak_val := current_streak_val + 1;
  elsif last_activity = current_date then
    -- Same day, don't change streak
    return;
  else
    -- Streak broken, reset to 1
    current_streak_val := 1;
  end if;
  
  -- Update longest streak if necessary
  if current_streak_val > longest_streak_val then
    longest_streak_val := current_streak_val;
  end if;
  
  -- Update profile
  update public.profiles
  set 
    current_streak = current_streak_val,
    longest_streak = longest_streak_val,
    last_activity_date = current_date,
    updated_at = now()
  where id = p_user_id;
end;
$$ language plpgsql security definer;

-- Function to check and award achievements
create or replace function public.check_and_award_achievements(p_user_id uuid)
returns void as $$
declare
  user_profile record;
  achievement_record record;
  activity_count integer;
begin
  -- Get user profile data
  select * into user_profile from public.profiles where id = p_user_id;
  
  -- Check all achievements
  for achievement_record in 
    select a.* from public.achievements a 
    where a.is_active = true 
    and a.id not in (
      select ua.achievement_id from public.user_achievements ua 
      where ua.user_id = p_user_id
    )
  loop
    case achievement_record.condition_type
      when 'points_threshold' then
        if user_profile.total_points >= achievement_record.condition_value then
          insert into public.user_achievements (user_id, achievement_id)
          values (p_user_id, achievement_record.id);
        end if;
        
      when 'streak_length' then
        if user_profile.longest_streak >= achievement_record.condition_value then
          insert into public.user_achievements (user_id, achievement_id)
          values (p_user_id, achievement_record.id);
        end if;
        
      when 'activity_count' then
        -- Count specific activity type
        select count(*) into activity_count
        from public.activity_log
        where user_id = p_user_id 
        and activity_type = achievement_record.condition_meta->>'activity_type';
        
        if activity_count >= achievement_record.condition_value then
          insert into public.user_achievements (user_id, achievement_id)
          values (p_user_id, achievement_record.id);
        end if;
    end case;
  end loop;
end;
$$ language plpgsql security definer;

-- Function to log user activity and award points
create or replace function public.log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_activity_data jsonb default '{}',
  p_points_earned integer default 0
)
returns void as $$
begin
  -- Insert activity log
  insert into public.activity_log (user_id, activity_type, activity_data, points_earned)
  values (p_user_id, p_activity_type, p_activity_data, p_points_earned);
  
  -- Update user streak
  perform public.update_user_streak(p_user_id);
  
  -- Add points if any
  if p_points_earned > 0 then
    perform public.add_points_to_user(
      p_user_id, 
      p_points_earned, 
      p_activity_type, 
      null, 
      'Activity: ' || p_activity_type
    );
  end if;
end;
$$ language plpgsql security definer;

-- Function to complete daily challenge
create or replace function public.complete_daily_challenge(
  p_user_id uuid,
  p_challenge_id uuid
)
returns boolean as $$
declare
  challenge_record record;
  progress_record record;
  points_to_award integer;
begin
  -- Get challenge info
  select * into challenge_record 
  from public.daily_challenges 
  where id = p_challenge_id and is_active = true;
  
  if not found then
    return false;
  end if;
  
  -- Get or create progress record
  insert into public.user_daily_progress (user_id, challenge_id, progress_date)
  values (p_user_id, p_challenge_id, current_date)
  on conflict (user_id, challenge_id, progress_date) 
  do nothing;
  
  -- Get current progress
  select * into progress_record
  from public.user_daily_progress
  where user_id = p_user_id 
  and challenge_id = p_challenge_id 
  and progress_date = current_date;
  
  -- Check if already completed
  if progress_record.is_completed then
    return false;
  end if;
  
  -- Increment progress
  update public.user_daily_progress
  set 
    current_progress = current_progress + 1,
    is_completed = case when current_progress + 1 >= challenge_record.target_value then true else false end,
    completed_at = case when current_progress + 1 >= challenge_record.target_value then now() else null end
  where id = progress_record.id;
  
  -- Award points if completed
  if progress_record.current_progress + 1 >= challenge_record.target_value then
    perform public.add_points_to_user(
      p_user_id,
      challenge_record.points_reward,
      'daily_challenge',
      p_challenge_id,
      'Daily Challenge: ' || challenge_record.name
    );
    return true;
  end if;
  
  return false;
end;
$$ language plpgsql security definer;
