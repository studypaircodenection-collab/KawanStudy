-- Add thumbnail support to notes system
-- Migration to add thumbnail/image fields to notes table

-- Add thumbnail fields to notes table
alter table public.notes add column if not exists thumbnail_url text;
alter table public.notes add column if not exists thumbnail_path text;
alter table public.notes add column if not exists thumbnail_file_name text;
alter table public.notes add column if not exists thumbnail_file_size bigint;

-- Add index for thumbnail queries
create index if not exists idx_notes_thumbnail on public.notes(thumbnail_url) where thumbnail_url is not null;

-- Update storage policies for thumbnails
-- Create storage bucket for note thumbnails if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('note-thumbnails', 'note-thumbnails', true)
on conflict (id) do nothing;

-- Storage policies for thumbnails
create policy "Anyone can view note thumbnails" on storage.objects
  for select using (bucket_id = 'note-thumbnails');

create policy "Authenticated users can upload note thumbnails" on storage.objects
  for insert with check (
    bucket_id = 'note-thumbnails' and 
    auth.role() = 'authenticated'
  );

create policy "Users can update their own note thumbnails" on storage.objects
  for update using (
    bucket_id = 'note-thumbnails' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own note thumbnails" on storage.objects
  for delete using (
    bucket_id = 'note-thumbnails' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add comment for documentation
comment on column public.notes.thumbnail_url is 'Public URL for the note thumbnail image';
comment on column public.notes.thumbnail_path is 'Storage path for the thumbnail file';
comment on column public.notes.thumbnail_file_name is 'Original filename of the thumbnail';
comment on column public.notes.thumbnail_file_size is 'Size of the thumbnail file in bytes';
