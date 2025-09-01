-- Notes System Migration
-- Creates tables and functions for the note upload and management system

-- Create notes table
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- Core content
  title text not null,
  description text,
  content text, -- For text-based notes
  content_type text check (content_type in ('pdf', 'text')) not null,
  
  -- Academic context
  subject text not null,
  topic text,
  academic_level text check (academic_level in ('high-school', 'undergraduate', 'graduate', 'professional')) not null,
  grade_year text,
  institution text,
  course text,
  professor text,
  semester text,
  
  -- Classification
  tags text[] default '{}',
  note_type text check (note_type in ('lecture-notes', 'summary', 'cheat-sheet', 'practice-problems', 'solutions', 'mind-map', 'other')) not null,
  language text check (language in ('english', 'bahasa-malaysia', 'chinese', 'tamil', 'other')) default 'english',
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')) default 'beginner',
  
  -- Sharing and permissions
  visibility text check (visibility in ('public', 'friends-only', 'private')) default 'private',
  target_audience text check (target_audience in ('students', 'educators', 'general')) default 'students',
  license text check (license in ('cc-by', 'cc-by-sa', 'cc-by-nc', 'all-rights-reserved')) default 'all-rights-reserved',
  allow_download boolean default true,
  allow_comments boolean default true,
  
  -- Source and attribution
  source_attribution text,
  source_type text check (source_type in ('original', 'textbook', 'lecture', 'research', 'other')) default 'original',
  source_reference text,
  
  -- File information (for PDF uploads)
  file_name text,
  file_size bigint,
  file_url text,
  file_path text, -- Supabase storage path
  
  -- Metadata
  estimated_read_time integer default 0, -- in minutes
  view_count integer default 0,
  download_count integer default 0,
  like_count integer default 0,
  
  -- Status and moderation
  status text check (status in ('draft', 'pending', 'published', 'rejected')) default 'draft',
  moderation_notes text,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_subject on public.notes(subject);
create index if not exists idx_notes_academic_level on public.notes(academic_level);
create index if not exists idx_notes_visibility on public.notes(visibility);
create index if not exists idx_notes_status on public.notes(status);
create index if not exists idx_notes_created_at on public.notes(created_at desc);
create index if not exists idx_notes_tags on public.notes using gin(tags);
create index if not exists idx_notes_search on public.notes using gin(to_tsvector('english', title || ' ' || description || ' ' || coalesce(content, '')));

-- Create note likes table
create table if not exists public.note_likes (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(note_id, user_id)
);

-- Create note comments table
create table if not exists public.note_comments (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.note_comments(id) on delete cascade, -- For threaded comments
  content text not null,
  status text check (status in ('active', 'hidden', 'deleted')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_note_comments_note_id on public.note_comments(note_id);
create index if not exists idx_note_comments_user_id on public.note_comments(user_id);
create index if not exists idx_note_comments_parent_id on public.note_comments(parent_id);

-- Create note downloads tracking table
create table if not exists public.note_downloads (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_note_downloads_note_id on public.note_downloads(note_id);
create index if not exists idx_note_downloads_user_id on public.note_downloads(user_id);

-- Create function to update note statistics
create or replace function public.update_note_stats()
returns trigger as $$
begin
  -- Update like count
  if TG_TABLE_NAME = 'note_likes' then
    if TG_OP = 'INSERT' then
      update public.notes 
      set like_count = like_count + 1,
          updated_at = now()
      where id = NEW.note_id;
    elsif TG_OP = 'DELETE' then
      update public.notes 
      set like_count = greatest(like_count - 1, 0),
          updated_at = now()
      where id = OLD.note_id;
    end if;
  end if;
  
  -- Update download count
  if TG_TABLE_NAME = 'note_downloads' and TG_OP = 'INSERT' then
    update public.notes 
    set download_count = download_count + 1,
        updated_at = now()
    where id = NEW.note_id;
  end if;
  
  return null;
end;
$$ language plpgsql security definer;

-- Create triggers
drop trigger if exists trigger_update_note_likes on public.note_likes;
create trigger trigger_update_note_likes
  after insert or delete on public.note_likes
  for each row execute function public.update_note_stats();

drop trigger if exists trigger_update_note_downloads on public.note_downloads;
create trigger trigger_update_note_downloads
  after insert on public.note_downloads
  for each row execute function public.update_note_stats();

-- Create function to increment view count
create or replace function public.increment_note_view(note_id uuid)
returns void as $$
begin
  update public.notes 
  set view_count = view_count + 1,
      updated_at = now()
  where id = note_id;
end;
$$ language plpgsql security definer;

-- Create function to search notes
create or replace function public.search_notes(
  search_query text default '',
  filter_subject text default null,
  filter_academic_level text default null,
  filter_note_type text default null,
  filter_language text default null,
  filter_difficulty text default null,
  filter_visibility text default 'public',
  sort_by text default 'created_at',
  sort_direction text default 'desc',
  page_limit integer default 20,
  page_offset integer default 0
)
returns table (
  id uuid,
  title text,
  description text,
  subject text,
  academic_level text,
  note_type text,
  language text,
  difficulty_level text,
  tags text[],
  estimated_read_time integer,
  view_count integer,
  download_count integer,
  like_count integer,
  created_at timestamp with time zone,
  user_profile json
) as $$
begin
  return query
  select 
    n.id,
    n.title,
    n.description,
    n.subject,
    n.academic_level,
    n.note_type,
    n.language,
    n.difficulty_level,
    n.tags,
    n.estimated_read_time,
    n.view_count,
    n.download_count,
    n.like_count,
    n.created_at,
    json_build_object(
      'id', p.id,
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ) as user_profile
  from public.notes n
  join public.profiles p on n.user_id = p.id
  where 
    n.status = 'published'
    and (filter_visibility is null or n.visibility = filter_visibility)
    and (filter_subject is null or n.subject = filter_subject)
    and (filter_academic_level is null or n.academic_level = filter_academic_level)
    and (filter_note_type is null or n.note_type = filter_note_type)
    and (filter_language is null or n.language = filter_language)
    and (filter_difficulty is null or n.difficulty_level = filter_difficulty)
    and (
      search_query = '' or
      to_tsvector('english', n.title || ' ' || n.description || ' ' || coalesce(n.content, '')) 
      @@ plainto_tsquery('english', search_query)
      or n.tags && string_to_array(search_query, ' ')
    )
  order by 
    case when sort_by = 'created_at' and sort_direction = 'desc' then n.created_at end desc,
    case when sort_by = 'created_at' and sort_direction = 'asc' then n.created_at end asc,
    case when sort_by = 'title' and sort_direction = 'desc' then n.title end desc,
    case when sort_by = 'title' and sort_direction = 'asc' then n.title end asc,
    case when sort_by = 'view_count' and sort_direction = 'desc' then n.view_count end desc,
    case when sort_by = 'view_count' and sort_direction = 'asc' then n.view_count end asc,
    case when sort_by = 'like_count' and sort_direction = 'desc' then n.like_count end desc,
    case when sort_by = 'like_count' and sort_direction = 'asc' then n.like_count end asc
  limit page_limit
  offset page_offset;
end;
$$ language plpgsql security definer;

-- Enable RLS (Row Level Security)
alter table public.notes enable row level security;
alter table public.note_likes enable row level security;
alter table public.note_comments enable row level security;
alter table public.note_downloads enable row level security;

-- RLS Policies for notes
create policy "Public notes are viewable by everyone" on public.notes
  for select using (visibility = 'public' and status = 'published');

create policy "Users can view their own notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on public.notes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notes" on public.notes
  for delete using (auth.uid() = user_id);

-- RLS Policies for note likes
create policy "Anyone can view note likes" on public.note_likes
  for select using (true);

create policy "Authenticated users can like notes" on public.note_likes
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Users can remove their own likes" on public.note_likes
  for delete using (auth.uid() = user_id);

-- RLS Policies for note comments
create policy "Anyone can view published note comments" on public.note_comments
  for select using (
    status = 'active' and
    exists (
      select 1 from public.notes 
      where id = note_id and status = 'published' and visibility = 'public'
    )
  );

create policy "Users can view comments on their notes" on public.note_comments
  for select using (
    exists (
      select 1 from public.notes 
      where id = note_id and user_id = auth.uid()
    )
  );

create policy "Authenticated users can comment on public notes" on public.note_comments
  for insert with check (
    auth.role() = 'authenticated' and 
    auth.uid() = user_id and
    exists (
      select 1 from public.notes 
      where id = note_id and status = 'published' and allow_comments = true
    )
  );

create policy "Users can update their own comments" on public.note_comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments" on public.note_comments
  for delete using (auth.uid() = user_id);

-- RLS Policies for note downloads
create policy "Anyone can view download stats" on public.note_downloads
  for select using (true);

create policy "Anyone can log downloads" on public.note_downloads
  for insert with check (true);

-- Create storage bucket for note files
insert into storage.buckets (id, name, public) 
values ('notes', 'notes', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can view note files" on storage.objects
  for select using (bucket_id = 'notes');

create policy "Authenticated users can upload note files" on storage.objects
  for insert with check (
    bucket_id = 'notes' and 
    auth.role() = 'authenticated'
  );

create policy "Users can update their own note files" on storage.objects
  for update using (
    bucket_id = 'notes' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own note files" on storage.objects
  for delete using (
    bucket_id = 'notes' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );
