-- Papers System Migration
-- Creates tables and functions for the final year paper library system

-- Create papers table
create table if not exists public.papers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- Core content
  title text not null,
  description text,
  
  -- Academic context
  subject text not null,
  academic_level text check (academic_level in ('undergraduate', 'graduate', 'phd')) default 'undergraduate',
  year integer check (year >= 2000 and year <= extract(year from current_date) + 1),
  institution text,
  course_code text,
  course_name text,
  professor text,
  semester text,
  
  -- Classification
  tags text[] default '{}',
  paper_type text check (paper_type in ('final-exam', 'midterm', 'assignment', 'project', 'thesis', 'other')) default 'final-exam',
  language text check (language in ('english', 'bahasa-malaysia', 'chinese', 'tamil', 'other')) default 'english',
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')) default 'intermediate',
  
  -- Paper files
  question_file_name text,
  question_file_size bigint,
  question_file_url text,
  question_file_path text, -- Supabase storage path
  
  -- Solution files (optional)
  solution_file_name text,
  solution_file_size bigint,
  solution_file_url text,
  solution_file_path text, -- Supabase storage path
  has_solution boolean default false,
  
  -- Sharing and permissions
  visibility text check (visibility in ('public', 'friends-only', 'private')) default 'public',
  allow_download boolean default true,
  allow_comments boolean default true,
  
  -- Source and attribution
  source_attribution text,
  source_type text check (source_type in ('original', 'provided-by-professor', 'past-student', 'official', 'other')) default 'original',
  
  -- Metadata
  view_count integer default 0,
  download_count integer default 0,
  like_count integer default 0,
  comment_count integer default 0,
  
  -- Status and moderation
  status text check (status in ('draft', 'pending', 'published', 'rejected')) default 'published',
  moderation_notes text,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists idx_papers_user_id on public.papers(user_id);
create index if not exists idx_papers_subject on public.papers(subject);
create index if not exists idx_papers_academic_level on public.papers(academic_level);
create index if not exists idx_papers_year on public.papers(year desc);
create index if not exists idx_papers_visibility on public.papers(visibility);
create index if not exists idx_papers_status on public.papers(status);
create index if not exists idx_papers_created_at on public.papers(created_at desc);
create index if not exists idx_papers_tags on public.papers using gin(tags);
create index if not exists idx_papers_search on public.papers using gin(to_tsvector('english', title || ' ' || description || ' ' || coalesce(course_name, '') || ' ' || coalesce(course_code, '')));

-- Create paper likes table
create table if not exists public.paper_likes (
  id uuid default gen_random_uuid() primary key,
  paper_id uuid references public.papers(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(paper_id, user_id)
);

-- Create paper comments table (reusing the pattern from notes)
create table if not exists public.paper_comments (
  id uuid default gen_random_uuid() primary key,
  paper_id uuid references public.papers(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.paper_comments(id) on delete cascade, -- For threaded comments
  content text not null,
  status text check (status in ('active', 'hidden', 'deleted')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_paper_comments_paper_id on public.paper_comments(paper_id);
create index if not exists idx_paper_comments_user_id on public.paper_comments(user_id);
create index if not exists idx_paper_comments_parent_id on public.paper_comments(parent_id);

-- Create paper downloads tracking table
create table if not exists public.paper_downloads (
  id uuid default gen_random_uuid() primary key,
  paper_id uuid references public.papers(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  file_type text check (file_type in ('question', 'solution')) not null,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_paper_downloads_paper_id on public.paper_downloads(paper_id);
create index if not exists idx_paper_downloads_user_id on public.paper_downloads(user_id);

-- Create paper views tracking table
create table if not exists public.paper_views (
  id uuid default gen_random_uuid() primary key,
  paper_id uuid references public.papers(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_paper_views_paper_id on public.paper_views(paper_id);
create index if not exists idx_paper_views_user_id on public.paper_views(user_id);

-- Enable RLS for all tables
alter table public.papers enable row level security;
alter table public.paper_likes enable row level security;
alter table public.paper_comments enable row level security;
alter table public.paper_downloads enable row level security;
alter table public.paper_views enable row level security;

-- Create policies for papers
create policy "Users can view published public papers" 
  on public.papers for select 
  using (status = 'published' and visibility = 'public');

create policy "Users can view their own papers" 
  on public.papers for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own papers" 
  on public.papers for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own papers" 
  on public.papers for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own papers" 
  on public.papers for delete 
  using (auth.uid() = user_id);

-- Create policies for paper likes
create policy "Users can view all paper likes" 
  on public.paper_likes for select 
  using (true);

create policy "Users can insert their own paper likes" 
  on public.paper_likes for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own paper likes" 
  on public.paper_likes for delete 
  using (auth.uid() = user_id);

-- Create policies for paper comments
create policy "Users can view paper comments for published papers" 
  on public.paper_comments for select 
  using (
    exists (
      select 1 from public.papers 
      where papers.id = paper_comments.paper_id 
      and papers.status = 'published' 
      and papers.allow_comments = true
    )
  );

create policy "Users can insert paper comments on published papers" 
  on public.paper_comments for insert 
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.papers 
      where papers.id = paper_id 
      and papers.status = 'published' 
      and papers.allow_comments = true
    )
  );

create policy "Users can update their own paper comments" 
  on public.paper_comments for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own paper comments" 
  on public.paper_comments for delete 
  using (auth.uid() = user_id);

-- Create policies for tracking tables
create policy "Users can view paper downloads" 
  on public.paper_downloads for select 
  using (true);

create policy "Users can insert paper downloads" 
  on public.paper_downloads for insert 
  with check (true);

create policy "Users can view paper views" 
  on public.paper_views for select 
  using (true);

create policy "Users can insert paper views" 
  on public.paper_views for insert 
  with check (true);

-- Function to update paper statistics
create or replace function public.update_paper_stats()
returns trigger as $$
begin
  if TG_TABLE_NAME = 'paper_likes' then
    if TG_OP = 'INSERT' then
      update public.papers 
      set like_count = like_count + 1 
      where id = NEW.paper_id;
    elsif TG_OP = 'DELETE' then
      update public.papers 
      set like_count = like_count - 1 
      where id = OLD.paper_id;
    end if;
  elsif TG_TABLE_NAME = 'paper_comments' then
    if TG_OP = 'INSERT' and NEW.status = 'active' then
      update public.papers 
      set comment_count = comment_count + 1 
      where id = NEW.paper_id;
    elsif TG_OP = 'UPDATE' then
      if OLD.status = 'active' and NEW.status != 'active' then
        update public.papers 
        set comment_count = comment_count - 1 
        where id = NEW.paper_id;
      elsif OLD.status != 'active' and NEW.status = 'active' then
        update public.papers 
        set comment_count = comment_count + 1 
        where id = NEW.paper_id;
      end if;
    elsif TG_OP = 'DELETE' and OLD.status = 'active' then
      update public.papers 
      set comment_count = comment_count - 1 
      where id = OLD.paper_id;
    end if;
  elsif TG_TABLE_NAME = 'paper_downloads' then
    if TG_OP = 'INSERT' then
      update public.papers 
      set download_count = download_count + 1 
      where id = NEW.paper_id;
    end if;
  end if;
  
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

-- Create triggers for statistics
create trigger update_paper_like_stats
  after insert or delete on public.paper_likes
  for each row execute function public.update_paper_stats();

create trigger update_paper_comment_stats
  after insert or update or delete on public.paper_comments
  for each row execute function public.update_paper_stats();

create trigger update_paper_download_stats
  after insert on public.paper_downloads
  for each row execute function public.update_paper_stats();

-- Function to handle updated_at for papers
create trigger handle_updated_at_papers
  before update on public.papers
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at_paper_comments
  before update on public.paper_comments
  for each row execute function public.handle_updated_at();

-- Function to track paper views (similar to notes)
create or replace function public.track_paper_view(
  p_paper_id uuid,
  p_user_id uuid default null,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns void as $$
declare
  view_exists boolean := false;
begin
  -- Check if this user has already viewed this paper today
  if p_user_id is not null then
    select exists(
      select 1 from public.paper_views 
      where paper_id = p_paper_id 
      and user_id = p_user_id 
      and created_at::date = current_date
    ) into view_exists;
  else
    -- For anonymous users, check by IP
    select exists(
      select 1 from public.paper_views 
      where paper_id = p_paper_id 
      and ip_address = p_ip_address 
      and created_at::date = current_date
    ) into view_exists;
  end if;
  
  -- Only insert if not viewed today
  if not view_exists then
    insert into public.paper_views (paper_id, user_id, ip_address, user_agent)
    values (p_paper_id, p_user_id, p_ip_address, p_user_agent);
    
    -- Update view count
    update public.papers 
    set view_count = view_count + 1 
    where id = p_paper_id;
  end if;
end;
$$ language plpgsql security definer;
