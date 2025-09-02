-- 024_user_sessions.sql
-- User sessions tracking for account security

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create user_sessions table
create table if not exists public.user_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_token text unique not null,
  device_type text, -- 'desktop', 'mobile', 'tablet'
  browser text,
  os text,
  ip_address inet,
  location text,
  user_agent text,
  is_current boolean default false,
  last_active timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone not null
);

-- Create indexes for better performance
create index if not exists user_sessions_user_id_idx on public.user_sessions(user_id);
create index if not exists user_sessions_session_token_idx on public.user_sessions(session_token);
create index if not exists user_sessions_expires_at_idx on public.user_sessions(expires_at);
create index if not exists user_sessions_last_active_idx on public.user_sessions(last_active);

-- Enable RLS
alter table public.user_sessions enable row level security;

-- RLS Policies
create policy "Users can view their own sessions"
  on public.user_sessions for select
  using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on public.user_sessions for delete
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.user_sessions for insert
  with check (auth.uid() = user_id);

-- Service role can manage all sessions
create policy "Service role can manage all sessions"
  on public.user_sessions for all
  using (auth.role() = 'service_role');

-- Function to clean up expired sessions
create or replace function public.cleanup_expired_sessions()
returns void
language plpgsql
as $$
begin
  delete from public.user_sessions 
  where expires_at < now();
end;
$$;

-- Function to update last active timestamp
create or replace function public.update_session_activity(session_token_param text)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_sessions 
  set last_active = now()
  where session_token = session_token_param;
end;
$$;

-- Function to get user sessions with formatted data
create or replace function public.get_user_sessions(user_id_param uuid)
returns table (
  id uuid,
  device_type text,
  browser text,
  os text,
  ip_address text,
  location text,
  last_active timestamp with time zone,
  created_at timestamp with time zone,
  is_current boolean
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    s.id,
    s.device_type,
    s.browser,
    s.os,
    s.ip_address::text,
    s.location,
    s.last_active,
    s.created_at,
    s.is_current
  from public.user_sessions s
  where s.user_id = user_id_param
    and s.expires_at > now()
  order by s.last_active desc;
end;
$$;

-- Function to delete a specific user session
create or replace function public.delete_user_session(session_id_param uuid, user_id_param uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.user_sessions 
  where id = session_id_param 
    and user_id = user_id_param;
end;
$$;

-- Create a trigger to automatically clean up expired sessions daily
-- This requires pg_cron extension which may not be available in all environments
-- You can run this manually or set up a cron job instead

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select, insert, delete on public.user_sessions to authenticated;
grant execute on function public.get_user_sessions to authenticated;
grant execute on function public.update_session_activity to authenticated;
grant execute on function public.delete_user_session to authenticated;
