-- Migration: Add duplicate prevention to notes view counter
-- This creates a note_views table and updates the view tracking system
-- to prevent duplicate views from the same user on the same day

-- Create note views tracking table (similar to paper_views)
create table if not exists public.note_views (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index if not exists idx_note_views_note_id on public.note_views(note_id);
create index if not exists idx_note_views_user_id on public.note_views(user_id);
create index if not exists idx_note_views_ip_address on public.note_views(ip_address);
create index if not exists idx_note_views_created_at on public.note_views(created_at);

-- Enable RLS
alter table public.note_views enable row level security;

-- Create policies for note_views
create policy "Users can view note views" 
  on public.note_views for select 
  using (true);

create policy "System can insert note views" 
  on public.note_views for insert 
  with check (true);

-- Create function to track note views with duplicate prevention (similar to papers)
create or replace function public.track_note_view(
  p_note_id uuid,
  p_user_id uuid default null,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns void as $$
declare
  view_exists boolean := false;
begin
  -- Check if this user has already viewed this note today
  if p_user_id is not null then
    select exists(
      select 1 from public.note_views 
      where note_id = p_note_id 
      and user_id = p_user_id 
      and created_at::date = current_date
    ) into view_exists;
  else
    -- For anonymous users, check by IP
    select exists(
      select 1 from public.note_views 
      where note_id = p_note_id 
      and ip_address = p_ip_address 
      and created_at::date = current_date
    ) into view_exists;
  end if;
  
  -- Only insert if not viewed today
  if not view_exists then
    insert into public.note_views (note_id, user_id, ip_address, user_agent)
    values (p_note_id, p_user_id, p_ip_address, p_user_agent);
    
    -- Update view count
    update public.notes 
    set view_count = view_count + 1,
        updated_at = now()
    where id = p_note_id;
  end if;
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function public.track_note_view to anon, authenticated;
