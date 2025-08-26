-- 001_profiles.sql
-- Base profiles table and related functions

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing profiles table to recreate with new structure
drop table if exists public.profiles cascade;

-- Create comprehensive profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  username text unique,
  email text,
  phone text,
  bio text,
  location text,
  university text,
  year_of_study text,
  major text,
  avatar_url text,
  
  -- Gamification fields
  total_points integer default 0,
  level integer default 1,
  experience_points integer default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Add constraints
  constraint username_length check (char_length(username) >= 3),
  constraint bio_length check (char_length(bio) <= 500),
  constraint location_length check (char_length(location) <= 100),
  constraint year_of_study_values check (year_of_study in ('1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'PhD')),
  constraint total_points_positive check (total_points >= 0),
  constraint level_positive check (level >= 1),
  constraint experience_points_positive check (experience_points >= 0)
);

-- Create indexes for profiles
create index idx_profiles_username on public.profiles(username);
create index idx_profiles_email on public.profiles(email);
create index idx_profiles_total_points on public.profiles(total_points desc);
create index idx_profiles_level on public.profiles(level desc);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Allow users to view other users' public profile information (including gamification stats)
create policy "Users can view public profile info" 
  on public.profiles for select 
  using (true);

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Function to generate unique username
create or replace function public.generate_unique_username(base_name text)
returns text as $$
declare
  username_attempt text;
  counter integer := 0;
begin
  -- Clean the base name: remove spaces, convert to lowercase, limit length
  base_name := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
  base_name := substring(base_name, 1, 20); -- Limit to 20 chars for counter space
  
  -- If base_name is empty, use 'user' as default
  if base_name = '' or base_name is null then
    base_name := 'user';
  end if;
  
  username_attempt := base_name;
  
  -- Keep trying until we find a unique username
  while exists(select 1 from public.profiles where username = username_attempt) loop
    counter := counter + 1;
    username_attempt := base_name || counter::text;
  end loop;
  
  return username_attempt;
end;
$$ language plpgsql security definer;

-- Comprehensive function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_full_name text;
  user_avatar_url text;
  user_email text;
  generated_username text;
begin
  -- Extract user information from auth metadata and email
  user_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1) -- fallback to email prefix
  );
  
  user_avatar_url := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    '/api/placeholder/100/100' -- default placeholder
  );
  
  user_email := new.email;
  
  -- Generate unique username based on full name or email
  generated_username := public.generate_unique_username(
    coalesce(user_full_name, split_part(user_email, '@', 1))
  );
  
  -- Insert new profile with comprehensive data
  insert into public.profiles (
    id, 
    full_name, 
    username,
    email,
    avatar_url,
    phone,
    bio,
    location,
    university,
    year_of_study,
    major,
    total_points,
    level,
    experience_points
  ) values (
    new.id,
    user_full_name,
    generated_username,
    user_email,
    user_avatar_url,
    new.raw_user_meta_data->>'phone',
    '',  -- empty bio initially
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'university',
    new.raw_user_meta_data->>'year_of_study',
    new.raw_user_meta_data->>'major',
    0,   -- initial points
    1,   -- initial level
    0    -- initial experience points
  );
  
  return new;
exception
  when others then
    -- Log error and still allow user creation
    raise log 'Error creating profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to check username availability
create or replace function public.check_username_availability(username_to_check text)
returns boolean as $$
begin
  return not exists(
    select 1 from public.profiles 
    where username = lower(username_to_check)
  );
end;
$$ language plpgsql security definer;

-- Function to get user profile by username
create or replace function public.get_profile_by_username(username_param text)
returns table(
  id uuid,
  full_name text,
  username text,
  bio text,
  location text,
  university text,
  year_of_study text,
  major text,
  avatar_url text,
  total_points integer,
  level integer,
  experience_points integer,
  created_at timestamp with time zone
) as $$
begin
  return query
  select 
    p.id,
    p.full_name,
    p.username,
    p.bio,
    p.location,
    p.university,
    p.year_of_study,
    p.major,
    p.avatar_url,
    p.total_points,
    p.level,
    p.experience_points,
    p.created_at
  from public.profiles p
  where p.username = username_param;
end;
$$ language plpgsql security definer;
