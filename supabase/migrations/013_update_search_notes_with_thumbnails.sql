-- Update search_notes function to include thumbnail support
-- Migration: 013_update_search_notes_with_thumbnails
-- Created: 2024

-- Drop the existing function
drop function if exists public.search_notes(
  text, text, text, text, text, text, text, text, text, integer, integer
);

-- Create updated function to search notes with thumbnail support
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
  thumbnail_url text,
  file_url text,
  content_type text,
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
    n.thumbnail_url,
    n.file_url,
    n.content_type,
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

-- Grant execute permissions
grant execute on function public.search_notes to anon, authenticated;

-- Add comment
comment on function public.search_notes is 'Search notes with full text search, filters, and thumbnail support';
